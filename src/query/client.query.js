const CLIENT_QUERY = {
  UPDATE_CLIENT: 'CALL upd_client(?, ?, ?, ?, ?, ?, ?)',
  CREATE_CLIENT: 'CALL create_client(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  DELETE_CLIENT: 'DELETE FROM Client WHERE client_id = ?',
  SELECT_CLIENTS: 'SELECT * FROM Client',
  SELECT_PAGED_CLIENTS: 'CALL getp_clients(?, ?, ?, ?)',
  SELECT_CLIENT: 'SELECT * FROM Client WHERE client_id = ?',
  // ClientXDevDay
  CREATE_CLIENTXDEVDAY: 'CALL create_clientxdevday(?, ?)',
  DELETE_CLIENTXDEVDAY: 'CALL rem_clientxdevday(?, ?)',
  SELECT_CLIENT_DEVDAYS: 'CALL get_client_devdays(?)',
  // Client Orders
  CREATE_CLIENTORDER: 'CALL create_clientOrder(?, ?)',
  SELECT_CLIENTORDERS: 'SELECT * FROM ClientOrder',
  SELECT_PAGED_CLIENTORDERS: 'CALL getp_clientOrders(?, ?, ?, ?)',
  SELECT_CLIENTORDER: 'SELECT * FROM ClientOrder WHERE client_order_id = ?',
  UPDATE_CLIENTORDER: 'CALL upd_clientOrder(?, ?)',
  SELECT_ORDERS_OF_CLIENT: 'CALL get_ordersOfClient(?)',
  SELECT_PAGED_ORDERS_OF_CLIENT: 'CALL getp_ordersOfClient(?, ?, ?, ?, ?)',
  DISPATCH_ORDER: 'CALL dispatch_order(?)',
  UPDATE_CLIENTORDER_DEVDAY: 'CALL upd_clientOrderDeliveryDate(?, ?)',
  SELECT_CLOSERDAY: 'SELECT getCloserDay(?, ?) AS CloserDay',
  SELECT_NEXTDATEOF: 'SELECT getNextDateOf(?) AS NextDateOf',
  // Client Order Details
  CREATE_CLIENTORDERDETAIL: 'CALL create_cltOrdDet(?, ?, ?)',
  SELECT_CLIENTORDERDETAILS: 'SELECT * FROM ClientOrderDetail',
  SELECT_PAGED_CLIENTORDERDETAILS: 'CALL getp_cltOrdDet(?, ?, ?, ?)',
  SELECT_DETAILS_OF_CLIENTORDER: 'CALL get_cltOrdDetOf(?)',
  SELECT_PAGED_DETAILS_OF_CLIENTORDER: 'CALL getp_cltOrdDetOf(?, ?, ?, ?, ?)',
  DELETE_CLIENTORDER: 'DELETE FROM ClientOrder WHERE client_order_id = ?'
};

export default CLIENT_QUERY;