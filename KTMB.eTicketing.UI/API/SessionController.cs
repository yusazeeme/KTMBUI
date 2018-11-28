using System;
using System.Collections.Generic;
using System.Data.SQLite;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.ServiceModel.Channels;
using System.Web;
using System.Web.Hosting;
using System.Web.Http;

namespace KTMB.eTicketing.UI.API
{
    public class SessionController : ApiController
    {
        [Route("api/session/all")]
        [HttpGet]
        public SessionDataResult AllMenu()
        {
            var sdr = new SessionDataResult() { Success = false };
            try
            {
                sdr.Success = true;
                sdr.SessionList = GetAllSession();
            }
            catch (Exception ex)
            {
                sdr.Message = ex.Message;
            }
            return sdr;
        }

        [Route("api/session/insert")]
        [HttpGet]
        public SessionDataResult Insert()
        {
            var sdr = new SessionDataResult() { Success = false };
            try
            {
                InsertNewSession();
                sdr.Success = true;
            }
            catch (Exception ex)
            {
                sdr.Message = ex.Message;
            }
            return sdr;
        }

        [Route("api/session/remove")]
        [HttpGet]
        public SessionDataResult Remove()
        {
            var sdr = new SessionDataResult() { Success = false };
            try
            {
                RemoveSession();
                sdr.Success = true;
            }
            catch (Exception ex)
            {
                sdr.Message = ex.Message;
            }
            return sdr;
        }

        [Route("api/session/checkqueue")]
        [HttpGet]
        public SessionDataResult CheckQueue(string count, string idlemin)
        {
            var sdr = new SessionDataResult() { Success = false };
            try
            {
                CheckTableExist();
                RemoveIdleSession(int.Parse(idlemin));
                SQLiteConnection m_dbConnection;
                m_dbConnection = new SQLiteConnection("Data Source=" + HostingEnvironment.MapPath("~") + "ktmb_live_session.db;Version=3;");
                m_dbConnection.Open();
                string sql = "SELECT COUNT(*) FROM session_list";
                SQLiteCommand command = new SQLiteCommand(sql, m_dbConnection);
                SQLiteDataReader reader = command.ExecuteReader();
                int currentSessionCount = 0;
                using (reader)
                {
                    while (reader.Read())
                    {
                        currentSessionCount = int.Parse(reader[0].ToString());
                    }
                }

                if (CheckIPExist())
                {
                    InsertNewSession();
                    sdr.Success = true;
                    return sdr;
                }

                if (currentSessionCount < int.Parse(count))
                {
                    InsertNewSession();
                    sdr.Success = true;
                    return sdr;
                }

                sdr.Message = "Max session reached!";
            }
            catch (Exception ex)
            {
                sdr.Message = ex.Message;
            }
            return sdr;
        }

        public bool CheckIPExist()
        {
            CheckTableExist();
            SQLiteConnection m_dbConnection;
            m_dbConnection = new SQLiteConnection("Data Source=" + HostingEnvironment.MapPath("~") + "ktmb_live_session.db;Version=3;");
            m_dbConnection.Open();
            string sql = "SELECT * FROM session_list WHERE IP = '" + GetClientIp() + "'";
            SQLiteCommand command = new SQLiteCommand(sql, m_dbConnection);
            SQLiteDataReader reader = command.ExecuteReader();
            using (reader)
            {
                while (reader.Read())
                {
                    return true;
                }
            }
            return false;
        }

        public void RemoveSession()
        {
            CheckTableExist();
            SQLiteConnection m_dbConnection;
            m_dbConnection = new SQLiteConnection("Data Source=" + HostingEnvironment.MapPath("~") + "ktmb_live_session.db;Version=3;");
            m_dbConnection.Open();
            string sql = "DELETE FROM session_list WHERE IP = '" + GetClientIp() + "';";
            var command = new SQLiteCommand(sql, m_dbConnection);
            command.ExecuteNonQuery();
        }

        public void RemoveIdleSession(int idlemin)
        {
            CheckTableExist();
            var sessionList = GetAllSession();
            foreach (var ses in sessionList)
            {
                var currentDT = DateTime.Now;
                var timeDiff = currentDT - ses.LastPing;
                if (timeDiff.TotalMinutes > idlemin)
                {
                    SQLiteConnection m_dbConnection;
                    m_dbConnection = new SQLiteConnection("Data Source=" + HostingEnvironment.MapPath("~") + "ktmb_live_session.db;Version=3;");
                    m_dbConnection.Open();
                    string sql = "DELETE FROM session_list WHERE SessionId = '" + ses.SessionId + "';";
                    var command = new SQLiteCommand(sql, m_dbConnection);
                    command.ExecuteNonQuery();
                }
            }
        }

        public List<SessionData> GetAllSession()
        {
            CheckTableExist();
            var sessionList = new List<SessionData>();
            SQLiteConnection m_dbConnection;
            m_dbConnection = new SQLiteConnection("Data Source=" + HostingEnvironment.MapPath("~") + "ktmb_live_session.db;Version=3;");
            m_dbConnection.Open();
            string sql = "select * from session_list";
            SQLiteCommand command = new SQLiteCommand(sql, m_dbConnection);
            SQLiteDataReader reader = command.ExecuteReader();
            using (reader)
            {
                while (reader.Read())
                {
                    var ses = new SessionData()
                    {
                        SessionId = int.Parse(reader["SessionId"].ToString()),
                        IP = reader["IP"].ToString(),
                        FirstPing = DateTime.Parse(reader["FirstPing"].ToString()),
                        LastPing = DateTime.Parse(reader["LastPing"].ToString())
                    };
                    sessionList.Add(ses);
                }
                return sessionList;
            }
        }

        public void InsertNewSession()
        {
            CheckTableExist();
            var sessionList = new List<SessionData>();
            CheckTableExist();
            SQLiteConnection m_dbConnection;
            m_dbConnection = new SQLiteConnection("Data Source=" + HostingEnvironment.MapPath("~") + "ktmb_live_session.db;Version=3;");
            m_dbConnection.Open();
            string sql = String.Empty;

            if (CheckIPExist())
            {
                sql = "UPDATE session_list SET LastPing = '" + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + "' WHERE IP = '" + GetClientIp() + "'";
            }
            else
            {
                var timeNow = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
                sql = "INSERT INTO session_list (IP, FirstPing, LastPing) values ('" + GetClientIp() + "', '" + timeNow + "', '" + timeNow + "')";
            }
            var command = new SQLiteCommand(sql, m_dbConnection);
            command.ExecuteNonQuery();
        }

        public static void CheckDBExist()
        {

            if (!File.Exists(HostingEnvironment.MapPath("~") + "/ktmb_live_session.db"))
                SQLiteConnection.CreateFile(HostingEnvironment.MapPath("~") + "/ktmb_live_session.db");
        }

        public static void CheckTableExist()
        {
            SQLiteConnection m_dbConnection;
            m_dbConnection = new SQLiteConnection("Data Source=" + HostingEnvironment.MapPath("~") + "ktmb_live_session.db;Version=3;");
            m_dbConnection.Open();
            string sql = "CREATE TABLE IF NOT EXISTS session_list (SessionId INTEGER PRIMARY KEY AUTOINCREMENT, IP VARCHAR(150), FirstPing DATETIME, LastPing DATETIME);";
            SQLiteCommand command = new SQLiteCommand(sql, m_dbConnection);
            command.ExecuteNonQuery();
        }

        public string GetClientIp(HttpRequestMessage request = null)
        {
            request = request ?? Request;

            if (request.Properties.ContainsKey("MS_HttpContext"))
            {
                return ((HttpContextWrapper)request.Properties["MS_HttpContext"]).Request.UserHostAddress;
            }
            else if (request.Properties.ContainsKey(RemoteEndpointMessageProperty.Name))
            {
                RemoteEndpointMessageProperty prop = (RemoteEndpointMessageProperty)request.Properties[RemoteEndpointMessageProperty.Name];
                return prop.Address;
            }
            else if (HttpContext.Current != null)
            {
                return HttpContext.Current.Request.UserHostAddress;
            }
            else
            {
                return null;
            }
        }

    }

    public class SessionDataResult
    {
        public List<SessionData> SessionList { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }
    }

    public class SessionData
    {
        public int SessionId { get; set; }
        public string IP { get; set; }
        public DateTime FirstPing { get; set; }
        public DateTime LastPing { get; set; }
    }

}
