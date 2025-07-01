from flask import Flask
from flask_cors import CORS
from models import iniciar_db
from routes.gastos import bp as gastos_bp
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

app = Flask(__name__)
CORS(app)

# Configurações de segurança
app.config['JWT_SECRET_KEY'] = 'K0`7^XNPVHRR'
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# Registra as rotas
app.register_blueprint(gastos_bp)

# Inicia o banco de dados
iniciar_db()

@app.route('/')
def home():
    return {'status': 'backend funcionando'}

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)