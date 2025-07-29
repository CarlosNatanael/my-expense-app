# Ficheiro: backend/routes/gastos.py

from flask import request, jsonify, Blueprint
import sqlite3
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from extensions import bcrypt

bp = Blueprint('gastos', __name__, url_prefix='/api')

def conectar():
    """Cria e retorna uma conexão com o banco de dados."""
    return sqlite3.connect('database.db')

# --- ROTAS DE AUTENTICAÇÃO ---

@bp.route('/register', methods=['POST'])
def register():
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
    dados = request.json
    conn = conectar()
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, nome, senha FROM usuarios WHERE email=?', (dados['email'],))
    user_data = cursor.fetchone()
    conn.close()

    if user_data:
        user_id, user_name, hashed_password = user_data
        # Verifica a senha enviada pelo frontend
        if bcrypt.check_password_hash(hashed_password, dados.get('password')):
            access_token = create_access_token(identity={'id': user_id, 'nome': user_name})
            return jsonify({
                'status': 'ok', 
                'token': access_token, 
                'usuario': {'id': user_id, 'nome': user_name}
            })
            
    return jsonify({'status': 'erro', 'mensagem': 'E-mail ou senha inválido'}), 401

# --- ROTAS DE GASTOS (CRUD) ---

@bp.route('/gastos', methods=['GET', 'POST'])
@jwt_required()
def handle_gastos():
    print("\n--- CABEÇALHO RECEBIDO EM /api/gastos ---")
    print(request.headers.get("Authorization"))
    print("-------------------------------------------\n")
    current_user = get_jwt_identity()
    usuario_id = current_user['id']
    conn = conectar()
    cursor = conn.cursor()

    if request.method == 'GET':
        cursor.execute('SELECT id, titulo, valor, tipo, data FROM gastos WHERE usuario_id=?', (usuario_id,))
        rows = cursor.fetchall()
        # Pega o nome das colunas a partir do cursor
        colnames = [d[0] for d in cursor.description]
        conn.close()
        
        # Converte o resultado em uma lista de dicionários para ser "jsonificável"
        gastos_list = [dict(zip(colnames, row)) for row in rows]
        return jsonify(gastos_list)

    if request.method == 'POST':
        d = request.json
        try:
            cursor.execute('''
                INSERT INTO gastos (usuario_id, titulo, valor, tipo, data)
                VALUES (?, ?, ?, ?, ?)
            ''', (usuario_id, d['titulo'], d['valor'], d['tipo'], d['data']))
            conn.commit()
            conn.close()
            return jsonify({'status': 'ok', 'mensagem': 'Gasto adicionado com sucesso!'}), 201
        except Exception as e:
            conn.rollback()
            conn.close()
            print(f"Erro ao inserir gasto: {e}")
            return jsonify({'status': 'erro', 'mensagem': 'Erro ao adicionar gasto.'}), 500