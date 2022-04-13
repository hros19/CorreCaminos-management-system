const JOBTITLE_QUERY = {
  CREATE_JOBTITLE: 'CALL create_job_title(?)', // (R), name
  SELECT_PAGED_JOBTITLES: 'CALL getp_job_titles(?, ?, ?)',
  UPDATE_JOBTITLE: 'CALL upd_job_title(?, ?)',
  SELECT_JOBTITLES: 'SELECT * FROM JobTitle',
  SELECT_JOBTITLE: 'SELECT * FROM JobTitle WHERE job_title_id = ?',
  DELETE_JOBTITLE: 'DELETE FROM JobTitle WHERE job_title_id = ?'
};

export default JOBTITLE_QUERY;