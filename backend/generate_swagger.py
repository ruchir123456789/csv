import json
from main import app

def dump_swagger_spec():
    # 1. Force FastAPI to generate the OpenAPI map
    openapi_schema = app.openapi()
    
    # 2. Define target destination file path
    output_file = "openapi.json"
    
    # 3. Write out structured schema mapping
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(openapi_schema, f, indent=4)
        
    print(f"[SUCCESS] Exported Swagger OpenAPI schema to: {output_file}")

if __name__ == "__main__":
    dump_swagger_spec()
