import logging
import random
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

# Known Indian IATA to ICAO mappings for AeroAPI
AIRPORT_ICAO_MAP = {
    "BLR": "VOBL",
    "DEL": "VIDP",
    "BOM": "VABB",
    "HYD": "VOHS",
    "CCU": "VECC",
    "MAA": "VOMM",
    "GOI": "VAGO",
    "IXC": "VICG",
    "COK": "VOCI",
    "PNQ": "VAPO",
    "AMD": "VAAH",
}

AIRPORT_META = {
    "BLR": {"name": "Kempegowda International Airport", "city": "Bengaluru", "country": "India"},
    "DEL": {"name": "Indira Gandhi International Airport", "city": "Delhi", "country": "India"},
    "BOM": {"name": "Chhatrapati Shivaji Maharaj International Airport", "city": "Mumbai", "country": "India"},
    "HYD": {"name": "Rajiv Gandhi International Airport", "city": "Hyderabad", "country": "India"},
    "CCU": {"name": "Netaji Subhash Chandra Bose International Airport", "city": "Kolkata", "country": "India"},
    "MAA": {"name": "Chennai International Airport", "city": "Chennai", "country": "India"},
}

AIRLINE_META = {
    "AI": {"name": "Air India", "country": "India"},
    "6E": {"name": "IndiGo", "country": "India"},
    "UK": {"name": "Vistara", "country": "India"},
    "SG": {"name": "SpiceJet", "country": "India"},
    "QP": {"name": "Akasa Air", "country": "India"},
    "I5": {"name": "AIX Connect", "country": "India"},
}


class AeroAPIService:
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self._api_key = api_key or settings.AEROAPI_KEY
        self._base_url = base_url or settings.AEROAPI_BASE_URL.rstrip("/")
        self._timeout = 10.0

    @property
    def api_key(self) -> Optional[str]:
        return self._api_key or settings.AEROAPI_KEY

    def set_api_key(self, key: str):
        self._api_key = key.strip() if key else None
        settings.AEROAPI_KEY = self._api_key

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 8)

    def _get_headers(self, key: Optional[str] = None) -> Dict[str, str]:
        active_key = key or self.api_key
        return {
            "x-apikey": active_key or "",
            "Accept": "application/json; charset=UTF-8"
        }

    def test_connection(self, key: Optional[str] = None) -> Dict[str, Any]:
        """
        Validates API key by issuing a lightweight test query to AeroAPI.
        """
        test_key = key or self.api_key
        if not test_key:
            return {
                "success": False,
                "status": "UNCONFIGURED",
                "message": "No AeroAPI key provided. Add AEROAPI_KEY to .env or settings."
            }

        url = f"{self._base_url}/airports/VOBL"
        try:
            with httpx.Client(timeout=self._timeout) as client:
                resp = client.get(url, headers=self._get_headers(test_key))
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "success": True,
                        "status": "CONNECTED",
                        "message": f"Successfully connected to FlightAware AeroAPI (Airport: {data.get('name', 'VOBL')})",
                        "details": data
                    }
                elif resp.status_code == 401:
                    return {
                        "success": False,
                        "status": "INVALID_KEY",
                        "message": "Authentication failed: Invalid FlightAware AeroAPI key (HTTP 401)."
                    }
                elif resp.status_code == 402 or resp.status_code == 429:
                    return {
                        "success": False,
                        "status": "RATE_LIMITED",
                        "message": "AeroAPI quota exceeded or account limit reached (HTTP 429/402)."
                    }
                else:
                    return {
                        "success": False,
                        "status": "ERROR",
                        "message": f"AeroAPI returned HTTP {resp.status_code}: {resp.text[:200]}"
                    }
        except Exception as e:
            logger.error(f"Error testing AeroAPI connection: {e}")
            return {
                "success": False,
                "status": "UNREACHABLE",
                "message": f"Unable to reach FlightAware AeroAPI: {str(e)}"
            }

    def get_flight(self, ident: str) -> Dict[str, Any]:
        """
        Retrieves real-time telemetry for a specific flight ident (e.g. AI245 or 6E302).
        """
        if self.is_configured():
            url = f"{self._base_url}/flights/{ident}"
            try:
                with httpx.Client(timeout=self._timeout) as client:
                    resp = client.get(url, headers=self._get_headers())
                    if resp.status_code == 200:
                        return {"success": True, "source": "AEROAPI", "data": resp.json()}
                    else:
                        logger.warning(f"AeroAPI returned {resp.status_code} for flight {ident}")
            except Exception as e:
                logger.error(f"Failed to fetch flight {ident} from AeroAPI: {e}")

        # Fallback simulation
        return {
            "success": True,
            "source": "SIMULATED_LIVE",
            "data": self._generate_simulated_flight(ident)
        }

    def fetch_airport_departures(self, airport_code: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Fetches departures for an airport code (IATA or ICAO).
        """
        iata = airport_code.upper().strip()
        icao = AIRPORT_ICAO_MAP.get(iata, iata)

        if self.is_configured():
            url = f"{self._base_url}/airports/{icao}/flights/scheduled_departures"
            try:
                with httpx.Client(timeout=self._timeout) as client:
                    resp = client.get(url, headers=self._get_headers(), params={"max_pages": 1})
                    if resp.status_code == 200:
                        payload = resp.json()
                        raw_flights = payload.get("scheduled_departures", [])
                        parsed = []
                        for rf in raw_flights[:limit]:
                            norm = self._normalize_aeroapi_flight(rf)
                            if norm:
                                parsed.append(norm)
                        if parsed:
                            return parsed
            except Exception as e:
                logger.warning(f"Failed to fetch departures for {icao} from AeroAPI: {e}")

        # Fallback to realistic live scheduled data
        return self._generate_simulated_departures(iata, limit)

    def _normalize_aeroapi_flight(self, rf: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            ident = rf.get("ident_iata") or rf.get("ident") or "FLIGHT"
            carrier = rf.get("operator_iata") or (ident[:2] if len(ident) >= 2 else "AI")
            
            origin_info = rf.get("origin") or {}
            origin_code = origin_info.get("code_iata") or origin_info.get("code") or "BLR"
            
            dest_info = rf.get("destination") or {}
            dest_code = dest_info.get("code_iata") or dest_info.get("code") or "DEL"
            
            sched_out = rf.get("scheduled_out")
            sched_in = rf.get("scheduled_in")
            
            if sched_out:
                dep_dt = datetime.fromisoformat(sched_out.replace("Z", "+00:00")).astimezone(timezone.utc).replace(tzinfo=None)
            else:
                dep_dt = datetime.utcnow() + timedelta(hours=2)
                
            if sched_in:
                arr_dt = datetime.fromisoformat(sched_in.replace("Z", "+00:00")).astimezone(timezone.utc).replace(tzinfo=None)
            else:
                arr_dt = dep_dt + timedelta(minutes=150)
                
            act_out = None
            if rf.get("actual_out"):
                act_out = datetime.fromisoformat(rf["actual_out"].replace("Z", "+00:00")).astimezone(timezone.utc).replace(tzinfo=None)

            act_in = None
            if rf.get("actual_in"):
                act_in = datetime.fromisoformat(rf["actual_in"].replace("Z", "+00:00")).astimezone(timezone.utc).replace(tzinfo=None)

            status_str = rf.get("status") or "SCHEDULED"
            if "En Route" in status_str:
                status = "EN_ROUTE"
            elif "Landed" in status_str or "Arrived" in status_str:
                status = "LANDED"
            elif "Cancel" in status_str:
                status = "CANCELLED"
            elif "Delay" in status_str:
                status = "DELAYED"
            else:
                status = "SCHEDULED"

            dep_delay_sec = rf.get("departure_delay") or 0
            aircraft_type = rf.get("aircraft_type") or "Airbus A320neo"

            return {
                "flight_number": ident.upper().strip(),
                "airline_code": carrier.upper().strip(),
                "origin_code": origin_code.upper().strip(),
                "destination_code": dest_code.upper().strip(),
                "scheduled_departure": dep_dt,
                "scheduled_arrival": arr_dt,
                "actual_departure": act_out,
                "actual_arrival": act_in,
                "status": status,
                "departure_delay_seconds": dep_delay_sec,
                "aircraft_model": aircraft_type,
                "source": "AEROAPI_LIVE"
            }
        except Exception as e:
            logger.error(f"Error normalizing AeroAPI flight: {e}")
            return None

    def _generate_simulated_departures(self, origin_code: str, count: int = 10) -> List[Dict[str, Any]]:
        hubs = [h for h in ["BLR", "DEL", "BOM", "HYD", "CCU", "MAA"] if h != origin_code]
        carriers = ["AI", "6E", "UK", "SG"]
        aircraft_models = ["Airbus A320neo", "Airbus A321neo", "Boeing 737 MAX 8", "Boeing 787-9 Dreamliner"]
        
        now = datetime.utcnow().replace(second=0, microsecond=0)
        flights = []

        for i in range(count):
            carrier = random.choice(carriers)
            flight_num = f"{carrier}{random.randint(101, 999)}"
            dest = random.choice(hubs)
            minutes_ahead = (i + 1) * 35 + random.randint(-10, 20)
            dep_dt = now + timedelta(minutes=minutes_ahead)
            duration_min = random.choice([85, 105, 125, 150, 175])
            arr_dt = dep_dt + timedelta(minutes=duration_min)

            delay_chance = random.random()
            if delay_chance > 0.75:
                status = "DELAYED"
                dep_delay_sec = random.randint(25, 80) * 60
                act_out = dep_dt + timedelta(seconds=dep_delay_sec)
            elif delay_chance < 0.15 and minutes_ahead <= 45:
                status = "EN_ROUTE"
                dep_delay_sec = 0
                act_out = dep_dt
            else:
                status = "SCHEDULED"
                dep_delay_sec = 0
                act_out = None

            flights.append({
                "flight_number": flight_num,
                "airline_code": carrier,
                "origin_code": origin_code,
                "destination_code": dest,
                "scheduled_departure": dep_dt,
                "scheduled_arrival": arr_dt,
                "actual_departure": act_out,
                "actual_arrival": None,
                "status": status,
                "departure_delay_seconds": dep_delay_sec,
                "aircraft_model": random.choice(aircraft_models),
                "source": "SIMULATED_LIVE"
            })

        return flights

    def _generate_simulated_flight(self, ident: str) -> Dict[str, Any]:
        carrier = ident[:2] if len(ident) >= 2 else "AI"
        now = datetime.utcnow()
        return {
            "ident": ident,
            "ident_iata": ident,
            "operator_iata": carrier,
            "origin": {"code_iata": "BLR", "name": "Kempegowda International"},
            "destination": {"code_iata": "DEL", "name": "Indira Gandhi International"},
            "status": "En Route / On Time",
            "progress_percent": 65,
            "altitude_feet": 36000,
            "groundspeed_knots": 465,
            "scheduled_out": (now - timedelta(minutes=70)).isoformat() + "Z",
            "actual_out": (now - timedelta(minutes=65)).isoformat() + "Z",
            "scheduled_in": (now + timedelta(minutes=85)).isoformat() + "Z",
            "estimated_in": (now + timedelta(minutes=80)).isoformat() + "Z",
            "departure_delay": 0,
            "arrival_delay": 0
        }

aeroapi_service = AeroAPIService()
