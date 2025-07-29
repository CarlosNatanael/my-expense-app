from flask import Flask, request
from flask_cors import CORS
from models import iniciar_db
from routes.gastos import bp as gastos_bp
from extensions import bcrypt, jwt

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE"], "allow_headers": ["Authorization", "Content-Type"]}})

app.config['JWT_SECRET_KEY'] = "pokemar16#"

app.config['JWT_TOKEN_LOCATION'] = ['headers']

app.config['JWT_CSRF_IN_COOKIES'] = False

bcrypt.init_app(app)
jwt.init_app(app)
app.register_blueprint(gastos_bp)

iniciar_db()

@app.route('/')
def home():
    return {'status': 'backend funcionando'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
