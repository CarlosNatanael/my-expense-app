# app.py

from flask import Flask, request
from flask_cors import CORS
from models import iniciar_db
from routes.gastos import bp as gastos_bp
from extensions import bcrypt, jwt

app = Flask(__name__)

CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE"], "allow_headers": ["Authorization", "Content-Type"]}})

# --- INÍCIO DA CORREÇÃO ---
# Configurações de segurança explícitas para a API

# 1. Chave secreta para assinar os tokens
app.config['JWT_SECRET_KEY'] = 'seu-segredo-super-forte-e-diferente'

# 2. Diz ao JWT para procurar o token apenas no cabeçalho 'Authorization'.
# Isso é fundamental para APIs.
app.config['JWT_TOKEN_LOCATION'] = ['headers']

# 3. Desativa explicitamente a verificação de CSRF.
# Esta é a correção mais importante. Para APIs consumidas por apps mobile,
# esta verificação não é necessária e causa o erro 422.
app.config['JWT_CSRF_IN_COOKIES'] = False
# --- FIM DA CORREÇÃO ---


# Inicializa as extensões com o nosso app
bcrypt.init_app(app)
jwt.init_app(app)

app.register_blueprint(gastos_bp)

iniciar_db()

@app.route('/')
def home():
    return {'status': 'backend funcionando'}

if __name__ == '__main__':
    # Garante que o servidor rode na porta 5000 para ser consistente
    app.run(host='0.0.0.0', port=5000, debug=True)
