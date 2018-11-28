using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace KTMB.eTicketing.UI.Controllers
{
    public class MarketingController : Controller
    {
        // GET: Marketing
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult LoyaltySetting()
        {
            return View();
        }

        public ActionResult PromotionSetting()
        {
            return View();
        }

        public ActionResult AddOnsSetting()
        {
            return View();
        }

        public ActionResult AddOnsTrainSetting()
        {
            return View();
        }

        public ActionResult VoucherSetting()
        {
            return View();
        }

        public ActionResult LowFareSetting()
        {
            return View();
        }

    }
}