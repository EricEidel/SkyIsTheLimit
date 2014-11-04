exports.send_query = function send_query(ibmdb, dsn_string, sql_statment)
{
	ibmdb.open(dsn_string, function(err, conn) 
	{
		 if (err) 
		 {
			return err;
		 } 
		 else 
		 {		 	
			conn.query(sql_statment, function (err,tables) 
			{
				if (err) 
				{
					conn.close();
					return ("SQL Error: " + err + "<br>\n");
				} 
				else
				{
				 	conn.close();
				 	return tables;
				}
			 });
		 }		
 	});
};