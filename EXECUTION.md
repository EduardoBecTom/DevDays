Para lanzar cada contenedor hay que hacer el build del contenedor del backend con `devdays-app con docker build -t devdays-app:latest .` en la terminal del proyecto base y luego hacer el build de la infraestructura entera con `docker compose -f docker-compose-local.yml up --build` en la ruta de \infraestructure.
* El backend se aloja en `http://localhost:3002`
* La base de datos en `http://localhost:27017/`
* Prometheus se exponen sus metricas en `http://localhost:9464/metrics` y la base de datos suya en `http://localhost:9090/query`
* Grafana se encuentra en `http://localhost:3001`
##  Nivel 0 y Nivel 1 (Base y Extensiones)
## N0
Para probar endpoint hacer llamada PUT `http://localhost:3002/api/v1/users/:Id` en el cuerpo en formato JSON marcar el campo que se quiere modificar del user
## N1-1
Se prueba el endpoint usando un POST a `http://localhost:3002/api/v1/issues/fetch` poniendo de cuerpo:``` {
    "repository": {
        "owner": "glzr-io",
        "name": "glazewm"
    }
}``` Y se comprueba la inmensa cantidad de issues recopiladas
## N1-2
En los logs del backend se muestra la nueva métrica de memoria
## N1-3
Asegurarse de estar usando el ollama.service.js en el controller
Tener instalado [Ollama](https://ollama.com/), ejecutar en la terminal: `ollama pull llama3.1:8b`. probar el endpoint POST `http://localhost:3002/api/v1/ai/chat` con cuerpo: ```json {"prompt": "Hola, que modelo eres?"}
## N2-P2-A

* endpoint POST  `http://localhost:3002/api/v1/audits/weather` ejecuta y almacena la auditoría de las últimas 4 semanas, Body: {"city" = "Sevilla"}

## N2-P2-B
POST	`http://localhost:3002/api/v1/ai/weather-audio`	genera y sirve un archivo de audio .mp3 con el resumen climático, que se podrá encontrar en la carpeta de audio_output, Body:
```json
{
  "city": "Valencia",
  "voice":"ballad"
}

```
## N2-P2-C
En Grafana, se ha configurado la DataSource apuntando a http://prometheus:9090. Utilizando un script de dashboard personalizado, que se importa del archivo /infrastructure/grafana/Dashboard.json
## N2-Ex-1
endpoint POST	`http://localhost:3002/api/v1/ai/uml`	Transforma un diagrama UML en texto plano a una estructura JSON organizada y validada.
Body:
```json
{
  "umlText": "@startuml\nclass Libro {\n  +String titulo\n  +String isbn\n  +prestar()\n}\n\nclass Autor {\n  +String nombre\n  +String nacionalidad\n}\n\nclass Prestamo {\n  +Date fechaInicio\n  +Date fechaFin\n}\n\nLibro \"*\" o-- \"1\" Autor : escrito por\nLibro \"1\" *-- \"*\" Prestamo : tiene\n@enduml"
}
```
