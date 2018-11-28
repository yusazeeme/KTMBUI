﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace KTMB.eTicketing.UI.Controllers
{
    public class TicketController : Controller
    {
        // GET: Ticket
        public ActionResult Home()
        {
            return View();
        }

        public ActionResult Select()
        {
            return View();
        }

        public ActionResult Passenger()
        {
            return View();
        }

        public ActionResult Seating()
        {
            return View();
        }

        public ActionResult Confirmation()
        {
            return View();
        }

        public ActionResult Receipt()
        {
            return View();
        }

        public ActionResult Print(Int64 id)
        {
            ViewBag.Id = id;
            return View();
        }

        public ActionResult PaymentFailed(Int64 id)
        {
            ViewBag.Id = id;
            return View();
        }
        
        public ActionResult Waiting()
        {
            return View();
        }

        public ActionResult WaitingForPayment()
        {
            return View();
        }

        public ActionResult GuestPrint()
        {
            return View();
        }

        public ActionResult ReselectSeat()
        {
            return View();
        }
        public ActionResult ReselectList()
        {
            return View();
        }
    }
}