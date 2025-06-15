#Esta clase trae la base de datos a nuestr app
#Por ende aqui se hace la conexion a la BD.
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase = create_client(url, key)