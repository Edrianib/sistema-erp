import os
import json
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Query
from pydantic import BaseModel
from typing import Union, Dict, Any, Optional, List
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("erp-ai")

load_dotenv()

DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "").strip()
DEEPSEEK_URL = "https://api.deepseek.com/chat/completions"
MODEL = "deepseek-chat"

if not DEEPSEEK_API_KEY:
    raise RuntimeError("DEEPSEEK_API_KEY no configurada en el archivo .env")

if not DEEPSEEK_API_KEY.startswith("sk-"):
    logger.warning("La API Key no parece tener el formato esperado por DeepSeek (debe comenzar con 'sk-').")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").strip()
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()

if not SUPABASE_URL:
    logger.warning("SUPABASE_URL no configurada. La conexion con Supabase no estara disponible.")

if not SUPABASE_SERVICE_ROLE_KEY:
    logger.warning("SUPABASE_SERVICE_ROLE_KEY no configurada. La conexion con Supabase no estara disponible.")

app = FastAPI(title="ERP AI Microservice", version="1.0.0")

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

@app.middleware("http")
async def log_cors_diagnostic(request: Request, call_next):
    origin = request.headers.get("origin", "(sin Origin)")
    logger.info("→ %s %s | Origin: %s", request.method, request.url.path, origin)
    response = await call_next(request)
    if request.method == "OPTIONS":
        logger.info("← OPTIONS → %d | Allow-Origin: %s",
                     response.status_code,
                     response.headers.get("access-control-allow-origin", "NO ENVIADO"))
    return response

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- Modelos Pydantic ----------
class AutocompletarRequest(BaseModel):
    producto: str


class CopilotoRequest(BaseModel):
    pregunta: str
    contexto: Union[Dict[str, Any], str] = ""


class ReporteEjecutivoRequest(BaseModel):
    ingresos_totales: float
    gastos_totales: float
    producto_mas_vendido: str = ""
    nivel_stock_critico: int = 0


@app.get("/")
async def health():
    return {
        "status": "ok",
        "service": "ERP AI Microservice",
        "endpoints": [
            "GET  /api/auth/me",
            "POST /api/analisis",
            "POST /api/autocompletar",
            "POST /api/copiloto",
            "POST /api/reporte-ejecutivo",
            "GET  /api/usuarios",
            "PUT  /api/usuarios/{user_id}",
            "DELETE /api/usuarios/{user_id}",
        ],
    }

SYSTEM_PROMPT = (
    "Eres un Analista Financiero senior especializado en ERP empresariales. "
    "Tu tarea es analizar los datos de ventas e inventario proporcionados y generar "
    "exactamente 3 viñetas con estrategias de negocio accionables, concretas y breves. "
    "Cada viñeta debe empezar con un guion (-) y contener una recomendacion especifica "
    "basada exclusivamente en los datos recibidos. "
    "No uses placeholders, no inventes datos y se estrictamente conciso. "
    "Formato de respuesta: solo las 3 viñetas, sin introduccion ni despedida."
)

AUTOCOMPLETAR_SYSTEM_PROMPT = (
    "Eres un experto en tecnologia y conoces a fondo los productos electronicos del mercado. "
    "Tu tarea es analizar el nombre o modelo de un producto proporcionado y devolver "
    "UNICA y EXCLUSIVAMENTE un objeto JSON valido con exactamente estos tres campos:\n"
    "- categoria: string (ej. 'Smartphones', 'Laptops', 'Audio', 'Wearables', 'Tablets', 'Gaming', 'Accesorios')\n"
    "- precio_sugerido: numero (precio realista de mercado en dolares, sin signos ni comas)\n"
    "- descripcion_corta: string (una frase breve en espanol describiendo el producto)\n\n"
    "Reglas estrictas:\n"
    "- NO incluyas texto adicional antes ni despues del JSON.\n"
    "- NO uses bloques de codigo markdown (```).\n"
    "- precio_sugerido debe ser un NUMBER, no un string.\n"
    "- Si no reconoces el producto, usa categoria 'Sin clasificar', precio_sugerido 0, y descripcion_corta 'Producto no identificado'."
)

COPILOTO_SYSTEM_PROMPT = (
    "Eres el Asistente Financiero inteligente de un sistema ERP. "
    "Tu unica fuente de informacion son los datos del ERP que el usuario te proporciona en cada mensaje. "
    "ERES TAMBIEN UN ANALISTA PREDICTIVO: si el usuario solicita proyecciones, estimaciones o pronosticos a futuro, "
    "TIENES LA OBLIGACION de realizarlos. Para ello, analiza la tendencia de crecimiento y la estacionalidad de los "
    "datos historicos proporcionados, calcula un porcentaje de crecimiento o promedio logico, y aplicalo "
    "matematicamente para proyectar las ventas del periodo solicitado. NUNCA digas que no tienes modelos predictivos; "
    "tu eres el modelo predictivo. JAMAS te niegues a hacer una estimacion matematica si tienes al menos un ano de datos "
    "historicos en el contexto.\n"
    "Reglas estrictas:\n"
    "- Responde de forma DIRECTA, CORTA y ANALITICA.\n"
    "- Basate en los datos proporcionados. Para preguntas historicas no inventes nada fuera del contexto. "
    "Para proyecciones futuras, usa calculos matematicos basados en las tendencias de los datos historicos.\n"
    "- Si los datos no contienen la respuesta y no se trata de una proyeccion, di claramente: "
    "'No tengo suficiente informacion en los datos proporcionados para responder esa pregunta.'\n"
    "- NO uses markdown, listas numeradas ni viñetas con asterisco. Solo texto plano.\n"
    "- Responde siempre en espanol.\n"
    "- Se conciso: maximo 3-4 oraciones por respuesta."
)

REPORTE_EJECUTIVO_SYSTEM_PROMPT = (
    "Eres el Director Financiero (CFO) de una empresa que utiliza un sistema ERP. "
    "Tu tarea es redactar un resumen ejecutivo profesional basado en las metricas financieras proporcionadas. "
    "Reglas estrictas:\n"
    "- Redacta exactamente 3 parrafos en texto puro (sin markdown, sin asteriscos, sin guiones).\n"
    "- Parrafo 1: Analiza la rentabilidad comparando ingresos vs gastos. Calcula el margen (porcentaje) y comenta si es saludable o preocupante.\n"
    "- Parrafo 2: Menciona el producto mas vendido (si se proporciono) y comenta el nivel de stock critico, dando una vision operativa.\n"
    "- Parrafo 3: Da una conclusion profesional definitiva sobre la salud financiera del negocio (Solida / Estable / En riesgo / Critica) y una recomendacion accionable.\n"
    "- Se formal pero conciso. No uses frases introductorias como 'A continuacion...' o 'En conclusion...'.\n"
    "- Responde UNICAMENTE con los 3 parrafos, sin titulo, sin encabezados, sin firma."
)


# ---------- Helper para llamadas a DeepSeek ----------
async def _deepseek_chat(messages: list, temperature: float = 0.7, max_tokens: int = 600):
    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }

    logger.info("Enviando peticion a DeepSeek API. Modelo: %s, Mensajes: %d", MODEL, len(messages))

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(DEEPSEEK_URL, headers=headers, json=payload)
    except httpx.TimeoutException:
        logger.error("Timeout al conectar con DeepSeek API")
        return None, JSONResponse(status_code=504, content={"error": "Timeout: la API de DeepSeek no respondio a tiempo."})
    except httpx.ConnectError:
        logger.error("No se pudo conectar con DeepSeek API")
        return None, JSONResponse(status_code=502, content={"error": "No se pudo conectar con la API de DeepSeek. Verifica la conectividad de red."})
    except Exception as exc:
        logger.error("Error inesperado en httpx: %s", str(exc))
        return None, JSONResponse(status_code=502, content={"error": f"Error de red al contactar DeepSeek: {str(exc)}"})

    if resp.status_code != 200:
        error_body = ""
        try:
            error_json = resp.json()
            error_body = json.dumps(error_json, ensure_ascii=False)
        except Exception:
            error_body = resp.text[:1000]

        logger.error("DeepSeek API respondio con %d: %s", resp.status_code, error_body)
        return None, JSONResponse(
            status_code=502,
            content={
                "error": f"DeepSeek API devolvio HTTP {resp.status_code}.",
                "detalle": error_body[:500],
            },
        )

    data = resp.json()
    contenido = data["choices"][0]["message"]["content"].strip()

    logger.info("DeepSeek respondio exitosamente (%d caracteres)", len(contenido))
    return contenido, None


@app.post("/api/analisis")
async def analizar_erp(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse(
            status_code=400,
            content={"error": "El cuerpo de la peticion debe ser JSON valido."},
        )

    ventas = body.get("ventas", [])
    inventario = body.get("inventario", [])
    alertas = body.get("alertas", [])

    user_prompt = _construir_prompt(ventas, inventario, alertas)

    headers = {
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 600,
        "stream": False,
    }

    logger.info("Enviando peticion a DeepSeek API. Modelo: %s, Mensajes: %d", MODEL, len(payload["messages"]))

    resp = None
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(DEEPSEEK_URL, headers=headers, json=payload)
    except httpx.TimeoutException:
        logger.error("Timeout al conectar con DeepSeek API")
        return JSONResponse(status_code=504, content={"error": "Timeout: la API de DeepSeek no respondio a tiempo."})
    except httpx.ConnectError:
        logger.error("No se pudo conectar con DeepSeek API")
        return JSONResponse(status_code=502, content={"error": "No se pudo conectar con la API de DeepSeek. Verifica la conectividad de red."})
    except Exception as exc:
        logger.error("Error inesperado en httpx: %s", str(exc))
        return JSONResponse(status_code=502, content={"error": f"Error de red al contactar DeepSeek: {str(exc)}"})

    if resp.status_code != 200:
        error_body = ""
        try:
            error_json = resp.json()
            error_body = json.dumps(error_json, ensure_ascii=False)
        except Exception:
            error_body = resp.text[:1000]

        logger.error("DeepSeek API respondio con %d: %s", resp.status_code, error_body)
        return JSONResponse(
            status_code=502,
            content={
                "error": f"DeepSeek API devolvio HTTP {resp.status_code}.",
                "detalle": error_body[:500],
            },
        )

    data = resp.json()
    contenido = data["choices"][0]["message"]["content"].strip()

    logger.info("DeepSeek respondio exitosamente (%d caracteres)", len(contenido))
    return JSONResponse(content={"analisis": contenido})


def _construir_prompt(ventas: list, inventario: list, alertas: list) -> str:
    partes = []

    if ventas:
        partes.append("--- DATOS DE VENTAS ---")
        for i, v in enumerate(ventas[:20], 1):
            partes.append(
                f"{i}. Producto: {v.get('producto', 'N/A')} | "
                f"Cantidad vendida: {v.get('cantidad', 0)} | "
                f"Total: ${v.get('total', 0)}"
            )

    if inventario:
        partes.append("\n--- DATOS DE INVENTARIO ---")
        for i, p in enumerate(inventario[:20], 1):
            partes.append(
                f"{i}. {p.get('producto', 'N/A')} (SKU: {p.get('sku', '?')}) | "
                f"Stock: {p.get('stock', 0)} | "
                f"Stock minimo: {p.get('stock_minimo', 0)} | "
                f"Precio: ${p.get('precio', 0)}"
            )

    if alertas:
        partes.append("\n--- ALERTAS DE DESABASTECIMIENTO ---")
        for i, a in enumerate(alertas[:10], 1):
            partes.append(
                f"{i}. {a.get('producto', 'N/A')} | "
                f"Stock: {a.get('stock', 0)} und | "
                f"Velocidad: {a.get('velocidad', 0)} und/dia | "
                f"Se agota en: {a.get('diasAgotar', '?')} dias | "
                f"Compra sugerida: {a.get('sugerido', 0)} und"
            )

    if not partes:
        partes.append("No se recibieron datos de ventas, inventario ni alertas.")

    partes.append(
        "\nCon base en los datos anteriores, genera exactamente 3 viñetas "
        "con estrategias de negocio. Se conciso."
    )

    return "\n".join(partes)


# ---------- Endpoint: Auth / Validar Sesion ----------
@app.get("/api/auth/me")
async def auth_me(request: Request):
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        logger.warning("Intento de acceso a /api/auth/me sin token Bearer.")
        return JSONResponse(status_code=401, content={"error": "Token de autorizacion no proporcionado."})

    token = auth_header[7:]

    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        logger.error("SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas. No se puede validar el token.")
        return JSONResponse(status_code=500, content={"error": "Servicio de autenticacion no configurado. Contacta al administrador."})

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                },
            )
    except Exception as exc:
        logger.error("Error de red al contactar Supabase Auth: %s", str(exc))
        return JSONResponse(status_code=502, content={"error": "No se pudo conectar con el servicio de autenticacion."})

    if resp.status_code != 200:
        logger.warning("Token invalido o sesion expirada. Supabase respondio HTTP %d.", resp.status_code)
        return JSONResponse(status_code=401, content={"error": "Token invalido o sesion expirada."})

    user_data = resp.json()
    logger.info("Sesion validada para usuario: %s", user_data.get("email", "desconocido"))
    return JSONResponse(content={"usuario": user_data})


# ---------- Endpoint: Auto-Completado Magico ----------
@app.post("/api/autocompletar")
async def autocompletar_producto(payload: AutocompletarRequest):
    producto = payload.producto.strip()
    if not producto:
        return JSONResponse(status_code=400, content={"error": "El campo 'producto' es obligatorio y no puede estar vacio."})

    user_prompt = f"Producto a analizar: {producto}"

    messages = [
        {"role": "system", "content": AUTOCOMPLETAR_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    contenido, error = await _deepseek_chat(messages, temperature=0.3, max_tokens=350)
    if error:
        return error

    try:
        contenido_limpio = contenido.strip()
        if contenido_limpio.startswith("```"):
            lineas = contenido_limpio.split("\n")
            lineas = lineas[1:]
            if lineas and lineas[-1].strip() == "```":
                lineas = lineas[:-1]
            contenido_limpio = "\n".join(lineas).strip()
            if contenido_limpio.lower().startswith("json"):
                contenido_limpio = contenido_limpio[4:].strip()

        sugerencia = json.loads(contenido_limpio)
        return JSONResponse(content={
            "producto": producto,
            "categoria": sugerencia.get("categoria", "Sin clasificar"),
            "precio_sugerido": sugerencia.get("precio_sugerido", 0),
            "descripcion_corta": sugerencia.get("descripcion_corta", ""),
        })
    except json.JSONDecodeError as e:
        logger.error("No se pudo parsear JSON de DeepSeek: %s. Contenido crudo: %s", str(e), contenido[:300])
        return JSONResponse(status_code=502, content={
            "error": "La IA no devolvio un JSON valido.",
            "crudo": contenido[:500],
        })


# ---------- Endpoint: Copiloto Financiero ----------
@app.post("/api/copiloto")
async def copiloto_financiero(payload: CopilotoRequest):
    pregunta = payload.pregunta.strip()
    if not pregunta:
        return JSONResponse(status_code=400, content={"error": "El campo 'pregunta' es obligatorio y no puede estar vacio."})

    contexto = payload.contexto
    if isinstance(contexto, dict):
        contexto = json.dumps(contexto, ensure_ascii=False)
    elif not contexto:
        contexto = "No se proporcionaron datos del ERP."

    user_prompt = (
        f"PREGUNTA DEL USUARIO:\n{pregunta}\n\n"
        f"DATOS DEL ERP:\n{contexto}"
    )

    messages = [
        {"role": "system", "content": COPILOTO_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    contenido, error = await _deepseek_chat(messages, temperature=0.5, max_tokens=400)
    if error:
        return error

    return JSONResponse(content={"pregunta": pregunta, "respuesta": contenido})


# ---------- Endpoint: Reporte Ejecutivo ----------
@app.post("/api/reporte-ejecutivo")
async def reporte_ejecutivo(payload: ReporteEjecutivoRequest):
    if payload.ingresos_totales < 0 or payload.gastos_totales < 0:
        return JSONResponse(status_code=400, content={"error": "Ingresos y gastos deben ser valores no negativos."})

    margen = 0.0
    if payload.ingresos_totales > 0:
        margen = ((payload.ingresos_totales - payload.gastos_totales) / payload.ingresos_totales) * 100

    user_prompt = (
        f"--- METRICAS FINANCIERAS DEL ERP ---\n"
        f"Ingresos totales: ${payload.ingresos_totales:,.2f}\n"
        f"Gastos totales: ${payload.gastos_totales:,.2f}\n"
        f"Margen de rentabilidad calculado: {margen:.1f}%\n"
        f"Producto mas vendido: {payload.producto_mas_vendido or 'No especificado'}\n"
        f"Nivel de stock critico (productos bajo minimo): {payload.nivel_stock_critico}\n\n"
        f"Redacta el resumen ejecutivo de 3 parrafos con base en estas metricas."
    )

    messages = [
        {"role": "system", "content": REPORTE_EJECUTIVO_SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    contenido, error = await _deepseek_chat(messages, temperature=0.6, max_tokens=500)
    if error:
        return error

    return JSONResponse(content={
        "resumen_ejecutivo": contenido,
        "metricas": {
            "ingresos_totales": payload.ingresos_totales,
            "gastos_totales": payload.gastos_totales,
            "margen_porcentaje": round(margen, 2),
            "producto_mas_vendido": payload.producto_mas_vendido,
            "nivel_stock_critico": payload.nivel_stock_critico,
        },
    })


# ---------- Modelos para Gestion de Usuarios ----------
class UsuarioUpdateRequest(BaseModel):
    nombre: Optional[str] = None
    rol: Optional[str] = None


# ---------- Helper: Cliente Admin de Supabase (via REST API) ----------
async def _supabase_admin_request(method: str, path: str, json_body: dict = None) -> httpx.Response:
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas.")
    url = f"{SUPABASE_URL}{path}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        if method == "GET":
            return await client.get(url, headers=headers)
        elif method == "PATCH":
            return await client.patch(url, headers=headers, json=json_body)
        elif method == "DELETE":
            return await client.delete(url, headers=headers)
        else:
            raise ValueError(f"Metodo HTTP no soportado: {method}")


# ---------- Helper: Verificar que el usuario solicitante es Admin ----------
async def _verificar_admin(user_id_header: str) -> Optional[dict]:
    if not user_id_header:
        return None
    try:
        resp = await _supabase_admin_request(
            "GET",
            f"/rest/v1/usuarios?id=eq.{user_id_header}&select=*"
        )
        if resp.status_code == 200:
            data = resp.json()
            if data and len(data) > 0:
                return data[0]
    except Exception as e:
        logger.error("Error al verificar admin: %s", str(e))
    return None


# ---------- Endpoints de Gestion de Usuarios ----------
@app.get("/api/usuarios")
async def listar_usuarios(request: Request):
    user_id = request.headers.get("X-User-Id", "").strip()
    if not user_id:
        return JSONResponse(status_code=401, content={"error": "Cabecera X-User-Id requerida."})

    admin_user = await _verificar_admin(user_id)
    if not admin_user or admin_user.get("rol") != "Admin":
        return JSONResponse(status_code=403, content={"error": "Acceso denegado. Se requiere rol de Administrador."})

    try:
        resp = await _supabase_admin_request("GET", "/rest/v1/usuarios?select=id,nombre,rol,ultimo_acceso&order=id")
        if resp.status_code != 200:
            return JSONResponse(status_code=502, content={"error": "Error al consultar usuarios en Supabase."})
        usuarios = resp.json()
        return JSONResponse(content={"usuarios": usuarios, "total": len(usuarios)})
    except Exception as e:
        logger.error("Error en GET /api/usuarios: %s", str(e))
        return JSONResponse(status_code=500, content={"error": "Error interno del servidor."})


@app.put("/api/usuarios/{user_id}")
async def actualizar_usuario(user_id: int, payload: UsuarioUpdateRequest, request: Request):
    requester_id = request.headers.get("X-User-Id", "").strip()
    if not requester_id:
        return JSONResponse(status_code=401, content={"error": "Cabecera X-User-Id requerida."})

    admin_user = await _verificar_admin(requester_id)
    if not admin_user or admin_user.get("rol") != "Admin":
        return JSONResponse(status_code=403, content={"error": "Acceso denegado. Se requiere rol de Administrador."})

    if payload.nombre is None and payload.rol is None:
        return JSONResponse(status_code=400, content={"error": "Debe proporcionar al menos 'nombre' o 'rol' para actualizar."})

    if payload.rol is not None and payload.rol not in ("Admin", "Gerente", "Vendedor"):
        return JSONResponse(status_code=400, content={"error": "Rol invalido. Use: Admin, Gerente o Vendedor."})

    if payload.nombre is not None and (len(payload.nombre.strip()) < 3):
        return JSONResponse(status_code=400, content={"error": "El nombre debe tener al menos 3 caracteres."})

    if requester_id == str(user_id) and payload.rol is not None and payload.rol != "Admin":
        return JSONResponse(status_code=400, content={"error": "No puedes quitarte el rol de Administrador a ti mismo."})

    update_data = {}
    if payload.nombre is not None:
        update_data["nombre"] = payload.nombre.strip()
    if payload.rol is not None:
        update_data["rol"] = payload.rol.strip()

    try:
        resp = await _supabase_admin_request(
            "PATCH",
            f"/rest/v1/usuarios?id=eq.{user_id}",
            json_body=update_data
        )
        if resp.status_code not in (200, 204):
            logger.error("Error al actualizar usuario %d: %s", user_id, resp.text)
            return JSONResponse(status_code=502, content={"error": "Error al actualizar usuario en Supabase."})
        logger.info("Usuario %d actualizado por admin %s: %s", user_id, requester_id, update_data)
        return JSONResponse(content={"mensaje": "Usuario actualizado correctamente.", "actualizado": update_data})
    except Exception as e:
        logger.error("Error en PUT /api/usuarios/%d: %s", user_id, str(e))
        return JSONResponse(status_code=500, content={"error": "Error interno del servidor."})


@app.delete("/api/usuarios/{user_id}")
async def eliminar_usuario(user_id: int, request: Request):
    requester_id = request.headers.get("X-User-Id", "").strip()
    if not requester_id:
        return JSONResponse(status_code=401, content={"error": "Cabecera X-User-Id requerida."})

    admin_user = await _verificar_admin(requester_id)
    if not admin_user or admin_user.get("rol") != "Admin":
        return JSONResponse(status_code=403, content={"error": "Acceso denegado. Se requiere rol de Administrador."})

    if requester_id == str(user_id):
        return JSONResponse(status_code=400, content={"error": "No puedes eliminar tu propio usuario."})

    target_user = await _verificar_admin(str(user_id))
    if target_user and target_user.get("rol") == "Admin":
        return JSONResponse(status_code=403, content={"error": "No se pueden eliminar cuentas de Administrador."})

    try:
        resp = await _supabase_admin_request("DELETE", f"/rest/v1/usuarios?id=eq.{user_id}")
        if resp.status_code not in (200, 204):
            logger.error("Error al eliminar usuario %d: %s", user_id, resp.text)
            return JSONResponse(status_code=502, content={"error": "Error al eliminar usuario en Supabase."})
        logger.info("Usuario %d eliminado por admin %s", user_id, requester_id)
        return JSONResponse(content={"mensaje": f"Usuario {user_id} eliminado correctamente."})
    except Exception as e:
        logger.error("Error en DELETE /api/usuarios/%d: %s", user_id, str(e))
        return JSONResponse(status_code=500, content={"error": "Error interno del servidor."})
