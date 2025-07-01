from flask import request, jsonify, current_app
from flask import Blueprint
import sqlite3
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

# Importa o 'bcrypt' que foi inicializado no app.py
from flask import current_app

bp = Blueprint('gastos', __name__, url_prefix='/api')

def conectar():
    return sqlite3.connect('database.db')

@bp.route('/register', methods=['POST'])
def register():
    dados = request.json
    bcrypt = current_app.extensions['bcrypt'] # Acessa a instância do bcrypt
    
    conn = conectar()
    cursor = conn.cursor()
    
    # Verifica se o e-mail já existe
    cursor.execute('SELECT id FROM usuarios WHERE email=?', (dados['email'],))
    if cursor.fetchone():
        conn.close()
        return jsonify({'mensagem': 'Este e-mail já está em uso.'}), 409

    # Cria o hash da senha
    hashed_password = bcrypt.generate_password_hash(dados['senha']).decode('utf-8')
    
    cursor.execute('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
                   (dados['nome'], dados['email'], hashed_password))
    conn.commit()
    conn.close()
    
    return jsonify({'status': 'ok', 'mensagem': 'Usuário criado com sucesso!'}), 201

@bp.route('/login', methods=['POST'])
def login():
    dados = request.json
    bcrypt = current_app.extensions['bcrypt']
    
    conn = conectar()
    cursor = conn.cursor()
    # Busca pelo email
    cursor.execute('SELECT id, nome, senha FROM usuarios WHERE email=?', (dados['email'],))
    user_data = cursor.fetchone()
    conn.close()

    if user_data:
        user_id, user_name, hashed_password = user_data
        # Compara a senha enviada com o hash salvo no banco
        if bcrypt.check_password_hash(hashed_password, dados['senha']):
            # Se a senha estiver correta, cria um token de acesso
            access_token = create_access_token(identity={'id': user_id, 'nome': user_name})
            return jsonify({
                'status': 'ok', 
                'token': access_token, 
                'usuario': {'id': user_id, 'nome': user_name}
            })
    
    return jsonify({'status': 'erro', 'mensagem': 'E-mail ou senha inválido'}), 401

@bp.route('/gastos', methods=['GET', 'POST'])
@jwt_required() # Protege a rota: só pode ser acessada com um token válido
def handle_gastos():
    # Identifica o usuário de forma segura a partir do token
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
    
    else:  # POST
        d = request.json
        cursor.execute('''
            INSERT INTO gastos (usuario_id, titulo, valor, tipo, data)
            VALUES (?,?,?,?,?)
        ''', (usuario_id, d['titulo'], d['valor'], d['tipo'], d['data'])) # Usa o ID seguro do token
        conn.commit()
        conn.close()
        return jsonify({'status': 'ok'}), 201
