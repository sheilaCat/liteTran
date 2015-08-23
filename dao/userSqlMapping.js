// dao/userSqlMapping.js
// CRUD SQL语句
var files_data = {
  insert:'INSERT INTO files_data(id, uin, keyid, filepath) VALUES(0,?,?,?)',
  queryBykey: 'select * from files_data where keyid = ?',
  update:'update files_data set uin = ?, keyid = ?, filepath = ?, date = ? where id=?',
  delete: 'delete from files_data where id=?',
  queryAll: 'select * from files_data'
};

module.exports = files_data;