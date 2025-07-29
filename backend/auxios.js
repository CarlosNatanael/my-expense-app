// Exemplo GET
axios.get('http://192.168.111:5000/api/gastos', {
  params: { usuario_id: 1 }
}).then(res => console.log(res.data));

// Exemplo POST
axios.post('http://192.168.0.111:5000/api/gastos', {
  usuario_id: 1,
  titulo: 'Almoço',
  valor: 25.00,
  tipo: 'despesa',
  data: '2025-07-01'
});
