using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace KTMB.eTicketing.UI.Controllers
{
    public class DynamicController : Controller
    {
        // GET: Dynamic
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Time()
        {
            return View();
        }

        public ActionResult Week()
        {
            return View();
        }

        public ActionResult Train()
        {
            return View();
        }

        public ActionResult Holiday()
        {
            return View();
        }
    }
}