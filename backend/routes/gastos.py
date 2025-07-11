# routes/gastos.py

from flask import request, jsonify
from flask import Blueprint
import sqlite3
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import bcrypt

bp = Blueprint('gastos', __name__, url_prefix='/api')

def conectar():
    return sqlite3.connect('database.db')

# --- NOVA ROTA DE DEPURAÇÃO ---
# Esta rota é pública e não tem o decorador @jwt_required().
# O seu único objetivo é imprimir os cabeçalhos que recebe.
@bp.route('/test-headers', methods=['GET'])
def test_headers():
    print("--- CABEÇALHOS RECEBIDOS EM /api/test-headers ---")
    print(request.headers)
    print("-------------------------------------------------")
    return jsonify({"message": "Teste de cabeçalhos recebido. Verifique o terminal do seu servidor Flask."})
# --- FIM DA NOVA ROTA ---


# As suas outras rotas continuam iguais
@bp.route('/register', methods=['POST'])
def register():
    # ... (código existente)
    dados = request.json
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM usuarios WHERE email=?', (dados['email'],))
    if cursor.fetchone():
        conn.close()
        return jsonify({'mensagem': 'Este e-mail já está em uso.'}), 409
    hashed_password = bcrypt.generate_password_hash(dados['senha']).decode('utf-8')
    cursor.execute('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
                   (dados['nome'], dados['email'], hashed_password))
    conn.commit()
    conn.close()
    return jsonify({'status': 'ok', 'mensagem': 'Usuário criado com sucesso!'}), 201

@bp.route('/login', methods=['POST'])
def login():
    # ... (código existente)
    dados = request.json
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute('SELECT id, nome, senha FROM usuarios WHERE email=?', (dados['email'],))
    user_data = cursor.fetchone()
    conn.close()
    if user_data:
        user_id, user_name, hashed_password = user_data
        if bcrypt.check_password_hash(hashed_password, dados['password']):
            access_token = create_access_token(identity={'id': user_id, 'nome': user_name})
            return jsonify({
                'status': 'ok', 
                'token': access_token, 
                'usuario': {'id': user_id, 'nome': user_name}
            })
    return jsonify({'status': 'erro', 'mensagem': 'E-mail ou senha inválido'}), 401

@bp.route('/gastos', methods=['GET', 'POST'])
@jwt_required()
def handle_gastos():
    # ... (código existente)
    current_user = get_jwt_identity()
    usuario_id = current_user['id']
    conn = conectar()
    cursor = conn.cursor()
    if request.method == 'GET':
        cursor.execute('SELECT * FROM gastos WHERE usuario_id=?', (usuario_id,))
        rows = cursor.fetchall()
        colnames = [d[0] for d in cursor.description]
        conn.close()
        return jsonify([dict(zip(colnames, r)) for r in rows])
    else:
        d = request.json
        cursor.execute('''
            INSERT INTO gastos (usuario_id, titulo, valor, tipo, data)
            VALUES (?,?,?,?,?)
        ''', (usuario_id, d['titulo'], d['valor'], d['tipo'], d['data']))
        conn.commit()
        conn.close()
        return jsonify({'status': 'ok'}), 201
