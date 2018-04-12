module.exports = {
    listInterviewee
};
const debug = require('debug')('hrms');
debug.enabled = true;
var mysql = require('mysql');
var config = require('../hrms/config/config.json');
var connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database
});

function listInterviewee(userEmail, date) {
    return new Promise(function (resolve, reject) {
        findEmployeeNumberByEmail(userEmail).then(function (rows) {
            var response = [];
            if (rows.length <= 0) {
                return resolve(response);
            }
            var emp_number = rows[0].emp_number;
            debug("emp_number: " + emp_number);

            var qCandidateList = "SELECT jii.interviewer_id, ji.interview_date, ji.interview_time, jc.first_name, jc.last_name, jv.name"
                + " FROM `ohrm_job_interview_interviewer` AS jii"
                + " LEFT JOIN `ohrm_job_interview` AS ji ON jii.interview_id = ji.id"
                + " LEFT JOIN `ohrm_job_candidate` AS jc ON ji.candidate_id = jc.id"
                + " LEFT JOIN `ohrm_job_candidate_vacancy` AS jcv ON jc.id = jcv.candidate_id"
                + " LEFT JOIN `ohrm_job_vacancy` AS jv ON jcv.vacancy_id = jv.id"
                + " INNER JOIN ( SELECT max(id) as maxid from `ohrm_job_interview` GROUP BY candidate_id,candidate_vacancy_id ) latest ON latest.maxid = ji.id"
                + " WHERE interviewer_id = "
                + emp_number
                + " AND jc.is_deleted = 0 AND jcv.status = 'INTERVIEW SCHEDULED'"
                + " AND CONCAT(ji.interview_date,' ',ji.interview_time)"
                + " BETWEEN "
                + date
                + " AND DATE_ADD("
                + date
                + ", INTERVAL 2 DAY) ORDER BY ji.interview_date";
            connection.query(qCandidateList, function (err, result) {
                if (err) {
                    throw err;
                }

                for (var i = 0; i < result.length; i++) {
                    var row = result[i];
                    if (row.hasOwnProperty('interviewer_id')) {
                        response.push({
                            interviewer_id: row.interviewer_id,
                            interview_date: row.interview_date,
                            interview_time: row.interview_time,
                            first_name: row.first_name,
                            last_name: row.last_name,
                            name: row.name
                        });
                    }
                }
                debug(response);
                return resolve(response);
            });
        }).catch((err) => setImmediate(() => {
            throw err;
        }));
    });
}

function findEmployeeNumberByEmail(userEmail) {

    return new Promise(function (resolve, reject) {
        var qEmployeeIdByEmail = "SELECT emp_number From hs_hr_employee WHERE emp_work_email = \"" + userEmail + "\"";
        connection.connect(function (err) {
            if (err) {
                throw err;
            }
            connection.query(qEmployeeIdByEmail, function (err, result) {
                if (err) {
                    throw err;
                }
                return resolve(result);
            });
        });
    });
}


