import sqlite3
import logging

# Configuração mínima dos logs
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',
    handlers=[logging.StreamHandler()]
)

logger = logging.getLogger(__name__)

def iniciar_db():
    """Inicializa o banco de dados criando as tabelas necessárias."""
    try:
        logger.info("\n> Iniciando banco de dados...")
        
        conn = sqlite3.connect('database.db')
        cursor = conn.cursor()
        
        # Criação das tabelas
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                senha TEXT NOT NULL                   
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS gastos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER NOT NULL,
                titulo TEXT NOT NULL,
                valor REAL NOT NULL,
                tipo TEXT NOT NULL,
                data TEXT NOT NULL,
                FOREIGN KEY(usuario_id) REFERENCES usuarios(id)                 
            )
        ''')
        
        conn.commit()
        logger.info("> Tabelas criadas/verificadas com sucesso")
        
    except sqlite3.Error as e:
        logger.error(f"> ERRO: {str(e)}")
        raise
        
    finally:
        if 'conn' in locals():
            conn.close()
            logger.info("> Conexão encerrada\n")

if __name__ == "__main__":
    iniciar_db()