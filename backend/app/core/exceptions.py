import uuid
from fastapi import Request, status
from fastapi.responses import JSONResponse


class FlightGuardException(Exception):
    def __init__(self, code: str, message: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        self.code = code
        self.message = message
        self.status_code = status_code


async def flightguard_exception_handler(request: Request, exc: FlightGuardException):
    request_id = getattr(request.state, "request_id", str(uuid.uuid4())[:8])
    origin = request.headers.get("origin")
    headers = {}
    if origin:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Vary"] = "Origin"
    return JSONResponse(
        status_code=exc.status_code,
        headers=headers,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
                "request_id": request_id
            }
        }
    )


async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    traceback.print_exc()
    request_id = getattr(request.state, "request_id", str(uuid.uuid4())[:8])
    origin = request.headers.get("origin")
    headers = {}
    if origin:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Vary"] = "Origin"
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        headers=headers,
        content={
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": f"Server error: {str(exc)}",
                "request_id": request_id
            }
        }
    )
