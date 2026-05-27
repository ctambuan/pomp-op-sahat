import { useState, useEffect, useCallback, useRef, memo, Component } from "react";
import { sGet, sSet, sList, onValue, ref, db } from "./firebase";

const T = {
  stone:"#f3ede4",cream:"#faf7f2",white:"#ffffff",ink:"#1a1512",mid:"#5c5048",
  muted:"#9c8e82",ghost:"#c8bdb4",forest:"#243d30",forestL:"#3a5c49",
  gold:"#9a7a40",goldL:"#c4a870",settled:"#2c5038",settledBg:"#edf4ef",
  warn:"#6b4c1e",warnBg:"#f9f2e8",danger:"#7a2e20",dangerBg:"#f8efed",
  abs:"#3a4a6a",absBg:"#eef0f6",line:"#e0d5c8",lineD:"#ccc0b0",
};

const PASSWORD = "OpSahat2026";
const COORDINATORS = ["Christine Tambunan","Nhaomy Panjaitan","Intan Tambunan","Rany Yamemia","Lusiana"];

const ALL_PAX = [
  {name:"Christine Tambunan",hh:"HH1"},{name:"Agustianto Batubara",hh:"HH1"},{name:"Alexander Batubara",hh:"HH1"},
  {name:"Agustinus Tambunan",hh:"HH2"},{name:"Linda Napitupulu",hh:"HH2"},{name:"Adolf Tambunan",hh:"HH2"},{name:"Intan Tambunan",hh:"HH2"},
  {name:"Monang Panjaitan",hh:"HH3"},{name:"Rohana Tambunan",hh:"HH3"},{name:"Nhaomy Panjaitan",hh:"HH3"},
  {name:"Gerard Sahat",hh:"HH4"},{name:"Diana Pardede",hh:"HH4"},{name:"Ferdiana Sondang",hh:"HH4"},
  {name:"Ronald Daniel",hh:"HH4"},{name:"Ivana Panjaitan",hh:"HH4"},{name:"Leandro Ratu",hh:"HH4"},
  {name:"Rany Yamemia",hh:"HH4"},{name:"Arlo Ratu",hh:"HH4"},{name:"Alora Ratu",hh:"HH4"},{name:"Lusiana",hh:"HH4"},
  {name:"Mariana Tambunan",hh:"HH5"},{name:"Olive Tambunan",hh:"HH5"},{name:"Nadia Tambunan",hh:"HH5"},
];

const BUDGET_DEFAULT = {
  perPax:3150000, lastSync:"21 Mei 2026",
  totals:{pax:20,gross:85904001,deposit:91142600,balance:5238599},
  households:[
    {id:"HH1",lead:"Christine Tambunan",members:["Christine Tambunan","Agustianto Batubara","Alexander Batubara"],
     pax:3,gross:9450000,deposit:13148850,balance:3698850,absorbed:false,subRows:[]},
    {id:"HH2",lead:"Agustinus Tambunan",members:["Agustinus Tambunan","Linda Napitupulu","Adolf Tambunan","Intan Tambunan"],
     pax:4,gross:21084667,deposit:21189000,balance:104333,absorbed:false,subRows:[]},
    {id:"HH3",lead:"Monang Panjaitan",members:["Monang Panjaitan","Rohana Tambunan","Nhaomy Panjaitan"],
     pax:3,gross:17934667,deposit:18020000,balance:85333,absorbed:false,subRows:[]},
    {id:"HH4",lead:"Gerard Sahat Pardomuan",members:["Gerard Sahat","Diana Pardede","Ferdiana Sondang","Ronald Daniel","Ivana Panjaitan","Leandro Ratu","Rany Yamemia","Arlo Ratu","Alora Ratu","Lusiana"],
     pax:10,gross:37434667,deposit:38784750,balance:1350083,absorbed:false,
     subRows:[
       {members:"Gerard Sahat & Diana Pardede",pax:2,gross:14784667,deposit:14821500,balance:36833},
       {members:"Ferdiana, Ronald, Ivana",pax:3,gross:8600000,deposit:8600000,balance:0},
       {members:"Leandro, Rany, Arlo, Alora",pax:4,gross:10900000,deposit:10900000,balance:0},
       {members:"Lusiana",pax:1,gross:3150000,deposit:4463250,balance:1313250},
     ]},
    {id:"HH5",lead:"Mariana Tambunan",members:["Mariana Tambunan","Olive Tambunan","Nadia Tambunan"],
     pax:3,gross:0,deposit:0,balance:0,absorbed:true,subRows:[],
     note:"Biaya diserap rata oleh HH2 + HH3 + HH4. HH1 dikecualikan."},
  ]
};

const ITINERARY = [
  {day:1,date:"Kamis, 2 Juli 2026",label:"Keberangkatan",events:[
    {time:"09.00",act:"Kumpul Priority Lounge",loc:"Stasiun Gambir, Jakarta",type:"assembly",note:"Boarding pukul 10.00"},
    {time:"10.30",act:"KAI Manahan Panoramic",loc:"Gambir → Tugu",type:"train",note:"22 pax. Solaria pre-order aktif."},
    {time:"17.23",act:"Tiba Yogyakarta",loc:"Stasiun Tugu",type:"arrival"},
    {time:"19.00",act:"Welcome Dinner",loc:"Kemangi Restaurant",type:"dining",sponsor:"HH4 · Gerard",note:"Smart casual"},
  ]},
  {day:2,date:"Jumat, 3 Juli 2026",label:"Merapi & Ayom",events:[
    {time:"07.00",act:"Sarapan",loc:"Kemangi Restaurant",type:"dining",sponsor:"HH4 · Gerard"},
    {time:"09.00",act:"Jeep Merapi Grinata",loc:"Lereng Merapi",type:"excursion",note:"16 pax"},
    {time:"12.00",act:"Makan Siang",loc:"Mbah Mo",type:"dining",sponsor:"HH3 · Monang"},
    {time:"17.00",act:"Makan Malam",loc:"Ayom Jogja",type:"dining",sponsor:"HH3 · Monang",note:"Pre-order tersedia"},
    {time:"00.00",act:"Hiace #1 ke Aveta Malioboro",loc:"Aveta Malioboro Hotel",type:"transport"},
  ]},
  {day:3,date:"Sabtu, 4 Juli 2026",label:"Prambanan & Jazz",events:[
    {time:"07.00",act:"Sarapan",loc:"Desa Palagan",type:"dining",sponsor:"HH2 · Agustinus"},
    {time:"09.00",act:"Free Time",loc:"Hyatt Regency Yogyakarta",type:"leisure",note:"Beristirahat atau jelajah hotel"},
    {time:"12.00",act:"Makan Siang",loc:"Djiwana Restaurant",type:"dining",sponsor:"HH2 · Agustinus"},
    {time:"15.30",act:"Nuvantara — Prambanan",loc:"Candi Prambanan",type:"excursion",note:"Termasuk dinner awal. Batik / Kebaya."},
    {time:"18.30",act:"Split: Hiace 1 → Hyatt · Hiace 2 → Jazz",loc:"Prambanan",type:"transport"},
    {time:"00.00",act:"Kembali ke Hyatt",loc:"Hyatt Regency Yogyakarta",type:"transport"},
  ]},
  {day:4,date:"Minggu, 5 Juli 2026",label:"Checkout & Pulang",events:[
    {time:"07.00",act:"Yoga Session",loc:"Hyatt Regency Yogyakarta",type:"leisure",sponsor:"HH1 · Agustianto",note:"Opsional — daftar via Rany"},
    {time:"11.30",act:"Checkout",loc:"Hyatt Regency Yogyakarta",type:"assembly"},
    {time:"12.00",act:"Makan Siang",loc:"Tentrem Summer Palace",type:"dining",sponsor:"HH1 · Agustianto"},
    {time:"15.00",act:"Transfer ke YIA",loc:"Yogyakarta International Airport",type:"transport"},
    {time:"18.05",act:"Garuda YIA → CGK",loc:"YIA",type:"departure"},
  ]},
];

// ── PATCH 2: Summer Palace added. PATCH 1: Tentrem removed from UPCOMING_FB ──
const RESTAURANTS = [
  {
    id:"solaria",name:"Solaria",subtitle:"D1 · KAI Manahan Panoramic · 2 Juli 2026",
    note:"Dibeli koordinator di Solaria · dibawa ke kereta · 22 pax",
    participants: ALL_PAX.filter(p=>p.name!=="Nadia Tambunan"),
    categories:[
      {id:"express",name:"Express Bowl",items:[
        {id:"eb-ayam",name:"Express Bowl Ayam",desc:"Pilihan saus: Mentega / Rica-rica / Asam Manis / Mayo / Teriyaki"},
        {id:"eb-ikan",name:"Express Bowl Ikan",desc:"Pilihan saus: Mentega / Rica-rica / Asam Manis / Mayo / Teriyaki"},
        {id:"eb-mix",name:"Express Bowl Mix",desc:"Udang, Ayam & Ikan. Pilihan saus: Mentega / Rica-rica / Asam Manis / Mayo / Teriyaki"},
      ]},
      {id:"special",name:"Menu Special",items:[
        {id:"sp-mie-katsu",name:"Mie + Ayam Katsu Teriyaki Saos",desc:"Noodle + Chicken Katsu Teriyaki Sauce"},
        {id:"sp-mie-teriyaki",name:"Mie Ayam Teriyaki",desc:"Chicken + Noodle Teriyaki"},
        {id:"sp-nasi-teriyaki",name:"Nasi + Ayam Teriyaki",desc:"Rice + Chicken Teriyaki"},
        {id:"sp-nasi-katsu",name:"Nasi + Ayam Katsu Teriyaki Saos",desc:"Rice + Chicken Katsu Teriyaki Sauce"},
        {id:"sp-nasi-bp",name:"Nasi + Ayam Crispy Black Pepper Sauce",desc:""},
        {id:"sp-nasi-lada",name:"Nasi + Ayam Lada Hitam Solaria",desc:"Rice + Chicken Black Pepper"},
        {id:"sp-sapo-sf",name:"Nasi + Sapo Tahu Seafood",desc:"Rice + Sapo Tofu Seafood"},
        {id:"sp-bulgogi",name:"Nasi + Chicken Bulgogi",desc:""},
        {id:"sp-spicy-mayo",name:"Nasi Crispy Chicken Spicy Mayo",desc:""},
        {id:"sp-spaghetti",name:"Spaghetti Bolognese",desc:""},
        {id:"sp-sapo-sapi",name:"Nasi + Sapo Tahu Sapi",desc:"Rice + Sapo Tofu Beef"},
        {id:"sp-sapo-ayam",name:"Nasi + Sapo Tahu Ayam",desc:"Rice + Sapo Tofu Chicken"},
        {id:"sp-mozarella-kf",name:"Chicken Mozarella + Kentang Goreng",desc:"Chicken Mozarella + French Fries"},
        {id:"sp-mozarella-ns",name:"Chicken Mozarella + Nasi",desc:""},
        {id:"sp-steak-ns",name:"Chicken Steak Chessy + Nasi",desc:""},
        {id:"sp-steak-kf",name:"Chicken Steak Chessy + Kentang Goreng",desc:""},
        {id:"sp-fc-kf",name:"Fish & Chips + Kentang Goreng",desc:""},
        {id:"sp-fc-ns",name:"Fish & Chips + Nasi",desc:""},
        {id:"sp-ccb-kf",name:"Chicken Cordon Bleu + Kentang Goreng",desc:""},
        {id:"sp-ccb-ns",name:"Chicken Cordon Bleu + Nasi",desc:""},
      ]},
      {id:"paket",name:"Menu Paket",items:[
        {id:"pk-capcay",name:"Nasi Cap Cay",desc:"Cap Cay Rice"},
        {id:"pk-cah-jamur",name:"Nasi Ayam Cah Jamur",desc:"Rice with Boiled Mushroom & Chicken"},
        {id:"pk-cah-kapri",name:"Nasi Ayam Cah Kapri",desc:"Rice with Boiled Snap Pea & Chicken"},
        {id:"pk-cah-kol",name:"Nasi Ayam Cah Kembang Kol",desc:"Rice with Boiled Cabbage & Chicken"},
        {id:"pk-fuyunghai",name:"Nasi Fu Yung Hai",desc:""},
        {id:"pk-gt",name:"Nasi + Ayam Goreng Tepung",desc:"Rice with Crunchy Fried Chicken"},
        {id:"pk-gm",name:"Nasi + Ayam Goreng Mentega",desc:"Rice with Butter Fried Chicken"},
        {id:"pk-bistik-ayam",name:"Nasi Bistik Ayam",desc:"Rice with Chicken Steak"},
        {id:"pk-udang",name:"Nasi + Udang Goreng Tepung",desc:"Rice with Crunchy Fried Shrimp"},
        {id:"pk-capcay-sf",name:"Nasi Cap Cay Seafood",desc:""},
        {id:"pk-sapi-mt",name:"Nasi Bistik Sapi Mentega",desc:"Rice with Butter Beef Steak"},
        {id:"pk-sapi-tp",name:"Nasi Bistik Sapi Tepung",desc:"Rice with Crunchy Beef Steak"},
        {id:"pk-ikan-mt",name:"Nasi + Ikan Fillet Goreng Mentega",desc:"Rice with Butter Fried Fish Fillet"},
        {id:"pk-ikan-tp",name:"Nasi + Ikan Fillet Goreng Tepung",desc:"Rice with Crunchy Fried Fish Fillet"},
        {id:"pk-ikan-rr",name:"Nasi + Ikan Fillet Goreng Rica-Rica",desc:"Rice with Chili Fried Fish Fillet"},
        {id:"pk-ikan-am",name:"Nasi + Ikan Fillet Asam Manis",desc:"Rice with Sweet & Sour Fried Fish Fillet"},
        {id:"pk-ayam-rr",name:"Nasi + Ayam Goreng Rica-Rica",desc:"Rice with Chili Fried Chicken"},
        {id:"pk-nanking",name:"Nasi + Ayam Nanking",desc:"Rice with Chicken Nanking"},
        {id:"pk-ayam-am",name:"Nasi + Ayam Asam Manis",desc:"Rice with Sweet and Sour Chicken"},
        {id:"pk-cumi-mt",name:"Nasi + Cumi Mentega",desc:"Rice with Butter Fried Squid"},
        {id:"pk-cumi-rr",name:"Nasi + Cumi Goreng Rica-Rica",desc:"Rice with Chili Fried Squid"},
        {id:"pk-cumi-tp",name:"Nasi + Cumi Goreng Tepung",desc:"Rice with Crunchy Fried Squid"},
      ]},
      {id:"porsi",name:"Menu Porsi",items:[
        {id:"po-ayam-mt",name:"Ayam Goreng Mentega",desc:"Butter Fried Chicken"},
        {id:"po-nanking",name:"Ayam Nanking",desc:"Nanking Chicken"},
        {id:"po-ayam-tp",name:"Ayam Goreng Tepung",desc:"Crunchy Fried Chicken"},
        {id:"po-bistik-ayam",name:"Bistik Ayam",desc:"Chicken Steak"},
        {id:"po-cah-kapri",name:"Ayam Cah Kapri",desc:"Chicken Boiled Podded Pea"},
        {id:"po-cah-jamur",name:"Ayam Cah Jamur",desc:"Chicken Boiled Chopped Mushroom"},
        {id:"po-cah-kol",name:"Ayam Cah Kembang Kol",desc:"Chicken Boiled Cauliflower"},
        {id:"po-fuyunghai",name:"Fu Yung Hai",desc:""},
        {id:"po-ikan-mt",name:"Fillet Ikan Goreng Mentega",desc:"Butter Fried Fish Fillet"},
        {id:"po-ikan-am",name:"Fillet Ikan Goreng Asam Manis",desc:"Sweet & Sour Fried Fish Fillet"},
        {id:"po-ayam-rr",name:"Ayam Goreng Rica-Rica",desc:"Chili Fried Chicken"},
        {id:"po-ayam-am",name:"Ayam Goreng Asam Manis",desc:"Sweet & Sour Chicken"},
        {id:"po-cumi-rr",name:"Cumi Goreng Rica-Rica",desc:"Chili Fried Squid"},
        {id:"po-cumi-mt",name:"Cumi Goreng Mentega",desc:"Butter Fried Squid"},
        {id:"po-sapi-mt",name:"Bistik Sapi Mentega",desc:"Butter Beef Steak"},
        {id:"po-sapi-tp",name:"Bistik Sapi Tepung",desc:"Crunchy Beef Steak"},
        {id:"po-ikan-rr",name:"Fillet Ikan Goreng Rica-Rica",desc:"Chili Fried Fish Fillet"},
        {id:"po-ikan-tp",name:"Fillet Ikan Goreng Tepung",desc:"Crunchy Fried Fish Fillet"},
        {id:"po-udang",name:"Udang Goreng Tepung",desc:"Crunchy Fried Shrimp"},
        {id:"po-cumi-tp",name:"Cumi Goreng Tepung",desc:"Crunchy Fried Squid"},
      ]},
      {id:"nasgor",name:"Nasi Goreng",items:[
        {id:"ng-teri-medan",name:"Nasi Goreng Teri Medan",desc:"Fried Rice with Anchovy Medan"},
        {id:"ng-sosis",name:"Nasi Goreng Sosis",desc:"Sausage Fried Rice"},
        {id:"ng-teri-cijo",name:"Nasi Goreng Teri Cabe Ijo",desc:"Green Chili Anchovy Fried Rice"},
        {id:"ng-seafood",name:"Nasi Goreng Seafood",desc:""},
        {id:"ng-smoked",name:"Smoked Chicken Fried Rice",desc:""},
        {id:"ng-spesial",name:"Nasi Goreng Spesial",desc:""},
        {id:"ng-ayam",name:"Nasi Goreng Ayam",desc:""},
        {id:"ng-petai",name:"Nasi Goreng Petai",desc:"Petai Fried Rice"},
        {id:"ng-italy",name:"Nasi Goreng Italy",desc:"Italian Fried Rice"},
        {id:"ng-kambing",name:"Nasi Goreng Kambing",desc:"Fried Rice Lamb"},
        {id:"ng-kepiting",name:"Nasi Goreng Kepiting Rajungan",desc:"Small Crab Fried Rice"},
        {id:"ng-modern",name:"Nasi Goreng Modern",desc:""},
        {id:"ng-sapi-cijo",name:"Nasi Goreng Sapi Cabe Ijo",desc:"Green Chili Beef Fried Rice"},
        {id:"ng-tomyum-sf",name:"Nasi Goreng Tom Yum Seafood",desc:""},
        {id:"ng-bebek",name:"Nasi Goreng Bebek Cabe Ijo",desc:"Green Chili Duck Fried Rice"},
        {id:"ng-tomyum-ayam",name:"Nasi Goreng Tom Yum Ayam",desc:""},
      ]},
      {id:"mie",name:"Menu Mie",items:[
        {id:"mi-bakso-mie",name:"Bakso Halus Mie/Bihun",desc:"Meatball with Noodle/Vermicelli"},
        {id:"mi-bakso-ikan",name:"Bakso Ikan Kuah",desc:"Fish Meatball"},
        {id:"mi-ayam",name:"Mie Ayam",desc:"Chicken Noodle"},
        {id:"mi-ayam-spesial",name:"Mie Ayam Solaria Spesial Pedas",desc:"Chicken Noodle Special Solaria Spicy"},
        {id:"mi-ayam-bakso",name:"Mie Ayam Bakso",desc:"Chicken Noodle with Meatball"},
        {id:"mi-ayam-pangsit",name:"Mie Ayam Pangsit Rebus",desc:"Chicken Noodle with Boiled Dumpling"},
        {id:"mi-ayam-pangsit-bakso",name:"Mie Ayam Pangsit Rebus Bakso",desc:"Chicken Noodle with Boiled Dumpling & Meatball"},
        {id:"mi-pangsit",name:"Pangsit Rebus",desc:"Boiled Dumpling"},
        {id:"mi-goreng-ayam",name:"Mie Goreng Ayam",desc:"Fried Noodle with Chicken"},
        {id:"mi-siram-ayam",name:"Mie Siram Ayam",desc:"Boiled Noodle with Chicken"},
        {id:"mi-siram-sapi",name:"Mie Siram Sapi",desc:"Boiled Noodle with Beef"},
        {id:"mi-ayam-kuah",name:"Mie Ayam Kuah",desc:"Soup Noodle with Chicken"},
        {id:"mi-goreng-sf",name:"Mie Goreng Seafood",desc:"Fried Noodle with Seafood"},
        {id:"mi-goreng-sapi",name:"Mie Goreng Sapi",desc:"Fried Noodle with Beef"},
      ]},
      {id:"kwetiau",name:"Kwetiau",items:[
        {id:"kw-ayam",name:"Kwetiau Ayam",desc:"Chicken Kwetiau"},
        {id:"kw-ayam-bakso",name:"Kwetiau Ayam Bakso",desc:"Chicken Kwetiau with Meatball"},
        {id:"kw-ayam-pangsit",name:"Kwetiau Ayam Pangsit Rebus",desc:"Chicken Kwetiau with Boiled Dumpling"},
        {id:"kw-ayam-pangsit-bakso",name:"Kwetiau Ayam Pangsit Rebus Bakso",desc:"Chicken Kwetiau with Boiled Dumpling & Meatball"},
        {id:"kw-goreng-ayam",name:"Kwetiau Goreng Ayam",desc:"Fried Kwetiau with Chicken"},
        {id:"kw-sapi-goreng",name:"Kwetiau Sapi Goreng",desc:"Fried Kwetiau with Beef"},
        {id:"kw-masak-ayam",name:"Kwetiau Masak Ayam",desc:"Cooked Chicken Kwetiau"},
        {id:"kw-siram-ayam",name:"Kwetiau Siram Ayam",desc:"Boiled Kwetiau with Chicken"},
        {id:"kw-sf-goreng",name:"Kwetiau Seafood Goreng",desc:"Seafood Fried Kwetiau"},
        {id:"kw-sf-siram",name:"Kwetiau Seafood Siram",desc:"Seafood Boiled Kwetiau"},
        {id:"kw-sapi-siram",name:"Kwetiau Sapi Siram",desc:"Boiled Kwetiau with Beef"},
      ]},
      {id:"bihun",name:"Bihun",items:[
        {id:"bh-ayam",name:"Bihun Ayam",desc:"Chicken Vermicelli"},
        {id:"bh-ayam-bakso",name:"Bihun Ayam Bakso",desc:"Chicken Meatball Vermicelli"},
        {id:"bh-ayam-pangsit",name:"Bihun Ayam Pangsit Rebus",desc:"Chicken Vermicelli with Boiled Dumplings"},
        {id:"bh-ayam-pangsit-bakso",name:"Bihun Ayam Pangsit Rebus Bakso",desc:"Chicken Vermicelli with Boiled Dumplings & Meatball"},
        {id:"bh-siram-ayam",name:"Bihun Siram Ayam",desc:"Boiled Vermicelli with Chicken"},
        {id:"bh-kuah-ayam",name:"Bihun Kuah Ayam",desc:"Soup Vermicelli with Chicken"},
        {id:"bh-goreng-ayam",name:"Bihun Goreng Ayam",desc:"Fried Vermicelli with Chicken"},
        {id:"bh-goreng-sapi",name:"Bihun Goreng Sapi",desc:"Fried Vermicelli with Beef"},
        {id:"bh-siram-sapi",name:"Bihun Siram Sapi",desc:"Boiled Vermicelli with Beef"},
        {id:"bh-goreng-sf",name:"Bihun Goreng Seafood",desc:"Seafood Fried Vermicelli"},
      ]},
      {id:"lomie",name:"Lo Mie & I Fu Mie",items:[
        {id:"lm-lomie",name:"Lo Mie",desc:""},
        {id:"lm-ifu-sf",name:"I Fu Mie Seafood",desc:""},
        {id:"lm-ifu",name:"I Fu Mie",desc:""},
      ]},
      {id:"snack",name:"Snack",items:[
        {id:"sn-wonton",name:"Crispy Mini Wonton",desc:""},
        {id:"sn-prawn",name:"Prawn Ball Satay",desc:""},
        {id:"sn-fishcake",name:"Fish Cake",desc:""},
        {id:"sn-springroll",name:"Spring Roll",desc:""},
        {id:"sn-cuttlefish",name:"Cuttlefish Ball Satay",desc:""},
        {id:"sn-siomay",name:"Siomay",desc:""},
        {id:"sn-ff",name:"French Fries",desc:""},
        {id:"sn-fishball",name:"Fish Ball Satay",desc:""},
      ]},
      {id:"lain",name:"Menu Lain",items:[
        {id:"ln-supayam",name:"Sup Ayam",desc:"Chicken Soup"},
        {id:"ln-capcay-kuah",name:"Cap Cay Kuah",desc:"Soup Cap Cay"},
        {id:"ln-capcay-sf",name:"Cap Cay Seafood",desc:""},
        {id:"ln-capcay-goreng",name:"Cap Cay Goreng",desc:"Fried Cap Cay"},
        {id:"ln-nasi-putih",name:"Nasi Putih",desc:"Rice"},
      ]},
      {id:"drinks",name:"Minuman",items:[
        {id:"dr-blueberry",name:"Blueberry Ice Blend",desc:""},{id:"dr-vanilla-latte",name:"Vanila Latte Ice Blend",desc:""},
        {id:"dr-cookies",name:"Cookies & Cream Iced Blend",desc:""},{id:"dr-taro",name:"Taro Milkshake",desc:""},
        {id:"dr-teh-tarik",name:"Teh Tarik",desc:""},{id:"dr-thai-tea",name:"Thai Tea",desc:""},
        {id:"dr-kopi-vn",name:"Kopi Vietnam",desc:""},{id:"dr-caramel",name:"Caramel Candy Blend",desc:""},
        {id:"dr-blackcurrant",name:"Blackcurrant",desc:""},{id:"dr-cappucino",name:"Frozen Cappucino",desc:""},
        {id:"dr-orange",name:"Orange Juice",desc:""},{id:"dr-alpukat",name:"Juice Alpukat",desc:""},
        {id:"dr-melon",name:"Juice Melon",desc:""},{id:"dr-sirzak",name:"Juice Sirzak",desc:""},
        {id:"dr-mangga",name:"Juice Mangga",desc:"Musiman"},{id:"dr-tomat",name:"Juice Tomat",desc:""},
        {id:"dr-esjeruk",name:"Es Jeruk",desc:""},{id:"dr-ms-strawberry",name:"Milkshake Strawberry",desc:""},
        {id:"dr-ms-choco",name:"Milkshake Chocolate",desc:""},{id:"dr-ms-vanilla",name:"Milkshake Vanilla",desc:""},
        {id:"dr-ms-blackcurrant",name:"Milkshake Blackcurrant",desc:""},{id:"dr-milo",name:"Milo",desc:""},
        {id:"dr-sejora",name:"Sejora",desc:""},{id:"dr-lemon-tea",name:"Es Lemon Tea",desc:""},
        {id:"dr-lemonade",name:"Es Lemonade",desc:""},{id:"dr-melon-lemonade",name:"Melon Lemonade",desc:""},
        {id:"dr-lychee",name:"Lychee Tea",desc:""},{id:"dr-ice-tea-green",name:"Ice Tea Green",desc:""},
        {id:"dr-coke",name:"Coke / Fanta / Sprite",desc:""},{id:"dr-teh-botol",name:"Teh Botol Sosro",desc:""},
        {id:"dr-air-mineral",name:"Air Mineral Botol",desc:""},{id:"dr-es-teh-manis",name:"Es Teh Manis",desc:""},
        {id:"dr-teh-manis-panas",name:"Teh Manis Panas",desc:""},{id:"dr-es-teh-tawar",name:"Es Teh Tawar",desc:""},
        {id:"dr-teh-panas",name:"Teh Panas",desc:""},{id:"dr-es-batu",name:"Es Batu",desc:""},
      ]},
    ]
  },
  {
    id:"ayom",name:"Ayom Jogja",subtitle:"D2 · Makan Malam · 3 Juli 2026, 17.00",
    note:"Restoran tepi sawah, Sukunan Banyuraden Gamping Sleman · 23 pax",
    participants: ALL_PAX,
    categories:[
      {id:"pembuka",name:"Pembuka",items:[
        {id:"ay-salmon-salad",name:"Salmon Salad",desc:"Salad salmon panggang, selada romain, tomat ceri, roti baguette"},
        {id:"ay-salad-udang",name:"Salad Udang Lotis",desc:"Udang rebus, buah-buahan, saus gula aren, cabai, ketumbar, kerupuk"},
        {id:"ay-caesar",name:"Classic Caesar Salad",desc:"Salad klasik. Tambahan: Chicken +18K / Beef +20K"},
      ]},
      {id:"khas",name:"Khas Ayom",items:[
        {id:"ay-nasi-campur",name:"Nasi Campur Sultan",desc:"Nasi basmati daun kemangi, bone marrow, ayam kampung goreng, sate sawah 1 tusuk, kering kentang, abon, urap, sambal matah"},
        {id:"ay-lobster",name:"Lobster Bakar",desc:"Bumbu santan pedas manis, sambal dabu plecing urap, nasi basmati koriander (98K/100gr)"},
        {id:"ay-ayam-sambal-ijo",name:"Ayam Sambal Ijo Nasi Daun Jeruk",desc:"Ayam bumbu kemangi, nasi basmati daun jeruk, sambal ijo, tomat ceri, jeruk limau, dabu merah hijau"},
        {id:"ay-sate-sawah",name:"Sate Ayam Sawah",desc:"Sate ayam bumbu kemangi, nasi basmati mentega, kecap cabe, tomat ceri, jeruk limau, dabu merah hijau"},
        {id:"ay-ayam-goreng-kampung",name:"Ayam Goreng Kampung Nasi Daun Kemangi",desc:"Ayam kampung goreng 1/2 ekor, nasi daun kemangi, urap, sambal matah"},
        {id:"ay-ayam-kriuk",name:"Ayam Kriuk Kriuk",desc:"Ayam ruas paha atas bumbu tepung, nasi basmati mentega, dabu merah hijau"},
        {id:"ay-bebek-tengil",name:"Bebek Tengil Nasi Daun Kemangi",desc:"Bebek goreng 1/2 ekor, nasi basmati daun kemangi, urap, sambal matah"},
        {id:"ay-sop-iga",name:"Sop Iga Sukunan",desc:"Sop bumbu khas Ayom, daging iga, termasuk nasi dan emping"},
        {id:"ay-rawon-iga",name:"Rawon Iga Hitam Manis",desc:"Rawon iga, nasi putih, telur asin brebes, kerupuk udang, sambal terasi"},
        {id:"ay-iga-bakar",name:"Iga Bakar 500 Gr",desc:"Iga bakar barbeque 500gr, jagung bakar, coleslaw, french fries"},
        {id:"ay-sate-maranggi",name:"Sate Bahari Maranggi",desc:"Tenderloin bumbu tradisional, nasi basmati mentega"},
        {id:"ay-udang-maharaja",name:"Udang Maharaja",desc:"Udang ukuran besar, bumbu khas Ayom manis dan pedas, nasi basmati mentega"},
        {id:"ay-sop-tenggiri",name:"Sop Ikan Tenggiri",desc:"Sop ikan tenggiri bumbu kuning, tomat hijau, belimbing wuluh, nasi putih, sambal terasi"},
        {id:"ay-pecel-rames",name:"Pecel Rames Sukunan",desc:"Nasi pecel bumbu kacang, ayam goreng, sate paru, 1/2 telur asin brebes"},
        {id:"ay-ayam-kecombrang",name:"Ayam Panggang Bumbu Kecombrang",desc:"Nasi basmati mentega, sambal matah"},
        {id:"ay-ikan-nila-bakar",name:"Ikan Nila Bakar Merah",desc:"Nasi basmati daun kemangi, dabu merah hijau, sambal kecap"},
      ]},
      {id:"seafood",name:"Seafood Khas Ayom",items:[
        {id:"ay-nasi-pedas-laut",name:"Nasi Pedas Lautan Rasa",desc:"Hidangan spesial memadukan kekayaan hasil laut, cita rasa pedas dan gurih"},
        {id:"ay-sate-tenggiri",name:"Sate Tenggiri Nusa Rasa",desc:"Sate tenggiri juicy, nasi kari"},
        {id:"ay-udang-sewindu",name:"Udang Sewindu",desc:"Grilled king tiger prawn, mixed tossed traditional blanched vegetables, plecing sambal, basmati butter rice"},
        {id:"ay-tilapia",name:"Tilapia Masak Dabu",desc:"Ikan tilapia bumbu kemangi, kentang tumbuk, tomat ceri, jeruk limau, dabu merah hijau"},
      ]},
      {id:"berbagi",name:"Hidangan Berbagi",items:[
        {id:"ay-sate-sawah-7",name:"Sate Sawah Tujuh Tusuk",desc:"Sate ayam bumbu kemangi 7 tusuk"},
        {id:"ay-udang-goreng-terasi",name:"Udang Goreng Sambal Terasi",desc:"Udang goreng, sajikan dengan sambal terasi"},
        {id:"ay-tenggiri-bakar",name:"Tenggiri Bakar Nusantara",desc:"Sate ikan tenggiri 5 tusuk, cita rasa laut khas, kreasi premium"},
      ]},
      {id:"nasgor",name:"Nasi Goreng",items:[
        {id:"ay-ng-rendang",name:"Nasi Goreng Rendang",desc:"Nasi goreng Sumatera bumbu rendang, kerupuk emping, daging sapi, telur goreng, sambal"},
        {id:"ay-ng-kambing",name:"Nasi Goreng Kambing",desc:""},
      ]},
      {id:"steak",name:"Steak Reguler",items:[
        {id:"ay-tenderloin",name:"Tenderloin",desc:"Grilled Tenderloin, mashed potato, mixed salad, blackpepper sauce"},
        {id:"ay-tenderloin-angus",name:"Tenderloin Angus",desc:"Grilled Tenderloin Angus, mashed potato, mixed salad, mushroom sauce"},
        {id:"ay-prime-angus",name:"Prime Angus Striploin",desc:"Grilled aussie premium angus striploin, mixed salad, chimichurri mushroom sauce"},
        {id:"ay-us-blade-150",name:"US Meat Steak 150gr",desc:"Grilled US Top Blade, french fries, mixed salad, mushroom sauce"},
        {id:"ay-us-blade-300",name:"US Meat Steak 300gr",desc:"Grilled US Top Blade, french fries, mixed salad, mushroom sauce"},
        {id:"ay-us-blade-500",name:"US Meat Steak 500gr",desc:"Grilled US Top Blade, french fries, mixed salad, mushroom sauce"},
        {id:"ay-ribeye",name:"Rib Eye",desc:"Grilled US Top Blade"},
      ]},
      {id:"steak-live",name:"Steak Live Cooking",items:[
        {id:"ay-lc-blade",name:"US Top Blade / 100gr",desc:"Grilled US Top Blade, french fries, mixed salad, mushroom sauce. Min order 500gr"},
        {id:"ay-lc-prime",name:"Prime Angus Striploin / 100gr",desc:"Grilled Striploin, french fries, mixed salad, mushroom sauce. Min order 500gr"},
        {id:"ay-lc-tenderloin-aussie",name:"Tenderloin Aussie / 100gr",desc:"Grilled Tenderloin, french fries, mixed salad, mushroom sauce. Min order 500gr"},
        {id:"ay-lc-tenderloin-angus",name:"Tenderloin Angus / 100gr",desc:"Grilled US Hanging Tender, french fries, mixed salad, mushroom sauce. Min order 500gr"},
      ]},
      {id:"western",name:"Western",items:[
        {id:"ay-salmon",name:"Norwegian Salmon",desc:"Ikan salmon, mashed potato, mixed salad"},
        {id:"ay-philly",name:"Philly Cheese Steak",desc:"Roti phily, isian daging cincang, french fries"},
        {id:"ay-burger",name:"American Burger",desc:"Burger isian daging paty, french fries"},
      ]},
      {id:"pasta",name:"Pasta",items:[
        {id:"ay-aglio",name:"Aglio E Olio Prawn Butter",desc:"Pasta dengan udang khas Ayom, olahan rempah, roti baguette"},
        {id:"ay-carbonara",name:"Carbonara Smoked Beef",desc:"Pasta saus keju, smoked beef, roti baguette"},
        {id:"ay-bolognese",name:"Ayom Bolognese",desc:"Pasta saus tomat, daging cincang, roti baguette"},
      ]},
      {id:"kreasi-nasi",name:"Kreasi Nasi",items:[
        {id:"ay-nasi-daun-jeruk",name:"Nasi Daun Jeruk Personal / Porsi",desc:""},
        {id:"ay-nasi-basmati",name:"Nasi Basmati Mentega Personal / Porsi",desc:""},
        {id:"ay-nasi-putih",name:"Nasi Putih",desc:""},
      ]},
      {id:"dessert",name:"Penutup",items:[
        {id:"ay-french-toast",name:"French Toast Ice Cream Vanila",desc:""},
      ]},
      {id:"additional",name:"Tambahan",items:[
        {id:"ay-extra-sambal",name:"Extra Sambal",desc:"Pilihan: Sambal Ijo / Sambal Merah / Sambal Matah / Sambal Terasi"},
        {id:"ay-extra-sauce",name:"Extra Sauce",desc:"Pilihan: Sauce Mushroom / Sauce BBQ / Sauce Blackpepper / Sauce Chimichurri"},
      ]},
    ]
  },
  // ─── PATCH 2: SUMMER PALACE ─────────────────────────────────────────────────
  {
    id:"summer-palace",name:"Summer Palace",subtitle:"D4 · Makan Siang · 5 Juli 2026, 12.00",
    note:"Hotel Tentrem, Jl. A.M. Sangaji No.72A, Yogyakarta · 23 pax · Sponsor: HH1 Agustianto",
    taxRate:0.21,
    deadline:"18 Juni 2026",
    participants: ALL_PAX,
    categories:[
      {id:"sp-appetizer",name:"Appetizer 开胃菜",items:[
        {id:"sp-app-01",name:"Cumi Goreng Madu Wijen Cabai",desc:"Deep fried baby squid, honey sesame chili sauce",price:68000,disabled:false},
        {id:"sp-app-02",name:"Kulit Ikan Jagung Manis Telur Asin",desc:"Deep fried fish skin & sweet corn in salted egg",price:58000,disabled:false},
        {id:"sp-app-03",name:"Ikan Teri Jepang Goreng Kemangi",desc:"Deep fried white bait fish, chili salt pepper, local basil",price:68000,disabled:false},
        {id:"sp-app-04",name:"Kepiting Gembos Goreng Telur Asin",desc:"Deep fried soft shell crab with chili salted egg yolk",price:108000,disabled:false},
        {id:"sp-app-05",name:"Terong Goreng Telur Asin Pedas",desc:"Deep fried egg plant with spicy salted egg",price:48000,disabled:false},
        {id:"sp-app-06",name:"Salad Ubur-ubur Chinese Style",desc:"Jelly fish salad Chinese style",price:58000,disabled:false},
      ]},
      {id:"sp-barbeque",name:"Barbeque 烧烤",items:[
        {id:"sp-bbq-01",name:"Aneka Panggangan Kanton ★",desc:"Cantonese assorted barbeque meat combination",price:388000,disabled:true},
        {id:"sp-bbq-02a",name:"Peking Duck ½ Ekor ★",desc:"Peking duck with lettuce, half bird",price:188000,disabled:true},
        {id:"sp-bbq-03",name:"Casio Ayam Madu (Chicken Leg)",desc:"BBQ honey roasted chicken leg",price:78000,disabled:false},
        {id:"sp-bbq-04c",name:"Bebek Panggang Hoisin (¼ Ekor)",desc:"Roasted duck with hoisin sauce, quarter bird",price:98000,disabled:false},
        {id:"sp-bbq-05a",name:"Ayam Hainan Saus Jahe (1 Ekor)",desc:"Poached Hainan chicken with ginger sauce, whole",price:198000,disabled:false},
        {id:"sp-bbq-05b",name:"Ayam Hainan Saus Jahe (½ Ekor)",desc:"Poached Hainan chicken with ginger sauce, half",price:108000,disabled:false},
      ]},
      {id:"sp-bird-nest",name:"Sarang Burung & Sari Laut Kering 燕窝",items:[
        {id:"sp-bn-01",name:"Angsio Sarang Burung Superior ★",desc:"Braised superior bird nest",price:398000,disabled:true},
        {id:"sp-bn-02",name:"Sarang Burung Kepiting & Telur Kepiting ★",desc:"Braised bird nest with fresh crab meat, crab roe and coriander leaf",price:258000,disabled:true},
        {id:"sp-bn-03",name:"Sarang Burung Kuah Beijing Ging Tong ★",desc:"Braised bird nest soup with dried seafood in Beijing Ging Tong",price:268000,disabled:true},
        {id:"sp-bn-04",name:"Kerang Abalone F3, Hoisam & Brokoli ★",desc:"Braised whole abalone (F3) with sea cucumber and broccoli in oyster sauce",price:448000,disabled:true},
      ]},
      {id:"sp-soup",name:"Sup 汤",items:[
        {id:"sp-soup-01",name:"Sup Maca, Kerang & Ayam (Double Boil)",desc:"Double boiled Peru maca root with sea conch and chicken",price:68000,disabled:false},
        {id:"sp-soup-02",name:"Sup Bunga Cordyceps & Ayam (Double Boil)",desc:"Double boiled cordyceps flower with chicken soup",price:118000,disabled:false},
        {id:"sp-soup-03",name:"Sup Kerang Abalone F10, Perut Ikan & Ginseng",desc:"Double boiled abalone (F10) with fish maw and ginseng root",price:148000,disabled:false},
        {id:"sp-soup-04",name:"Sup Bibir Ikan & Jamur",desc:"Fish lip soup combination with mushroom",price:48000,disabled:false},
        {id:"sp-soup-05",name:"Sup Asparagus Kepiting Segar",desc:"Asparagus soup with fresh crab meat",price:48000,disabled:false},
        {id:"sp-soup-06",name:"Sup Hisit Summer Palace ★",desc:"Summer Palace shark's fin soup",price:338000,disabled:true},
        {id:"sp-soup-07",name:"Sup Ayam Rempah China (Double Boil)",desc:"Double boiled chicken village with Chinese herb",price:98000,disabled:false},
        {id:"sp-soup-08",name:"Sup Shanghai",desc:"Soup Shanghai",price:48000,disabled:false},
      ]},
      {id:"sp-live-seafood",name:"Sari Laut Hidup 活海鲜 ⚠️",items:[
        {id:"sp-ls-01",name:"Lobster (per 100g) ★",desc:"Cold salad / steam garlic / baked cheese / superior stock / ginger onion / salted egg — harga pasar",price:158000,disabled:true},
        {id:"sp-ls-02",name:"Ikan Kerapu Macan (per 100g) ★",desc:"Steam garlic / Hong Kong / lotus leaf chicken / Teo Chiew / deep fried / claypot — harga pasar",price:78000,disabled:true},
        {id:"sp-ls-03",name:"Ikan Malas / Pelangi (per 100g) ★",desc:"Steam garlic / Hong Kong / lotus leaf chicken / Teo Chiew / deep fried / claypot — harga pasar",price:88000,disabled:true},
        {id:"sp-ls-04",name:"Ikan Gurame (per 100g) ★",desc:"Steam garlic / Hong Kong / Thailand style / deep fried / Thai chili — harga pasar",price:28000,disabled:true},
      ]},
      {id:"sp-fresh-seafood",name:"Sari Laut Segar 海鲜",items:[
        {id:"sp-fs-01",name:"Ikan Halibut Panggang Putih Telur & Telur Asin",desc:"Oven baked halibut fillet topped with egg white, served with salted egg fish skin",price:78000,disabled:false},
        {id:"sp-fs-02",name:"Kepiting Soka Goreng Thai",desc:"Deep fried soft shell crab with Thai chili sauce topped with garnish",price:118000,disabled:false},
        {id:"sp-fs-03",name:"Udang Goreng Wasabi Mayo & Salsa Mangga",desc:"Crispy prawn with wasabi mayonnaise and mango salsa, served in a basket",price:118000,disabled:false},
        {id:"sp-fs-04",name:"Udang Windu Goreng Oatmeal & Daun Kari",desc:"Deep fried king prawn with oatmeal & curry leaf",price:138000,disabled:false},
        {id:"sp-fs-05",name:"Udang Goreng Telur Emas",desc:"Deep fried butter prawn with a golden egg",price:138000,disabled:false},
        {id:"sp-fs-06",name:"Udang Goreng Mayo & Kerupuk Jagung",desc:"Deep fried prawn meat with sweet mayonnaise topped with corn flakes",price:118000,disabled:false},
        {id:"sp-fs-07",name:"Bistik Skalop Isi Udang & Ayam Saus Singapore",desc:"Pan fried scallop stuffed with prawn chicken meat with Singapore chili sauce",price:198000,disabled:false},
        {id:"sp-fs-08",name:"Tumis Skalop Brokoli Saus XO ★",desc:"Sauteed scallop with broccoli and XO sauce",price:228000,disabled:true},
      ]},
      {id:"sp-claypot",name:"Claypot / Hot Plate / Hot Stone 沙煲",items:[
        {id:"sp-cp-01",name:"Sapo Kari Udang & Mantau Goreng",desc:"Claypot curry prawn with Chinese fried bun",price:138000,disabled:false},
        {id:"sp-cp-02",name:"Sapo Terong, Tofu & Ayam Cincang Cabai",desc:"Stewed eggplant and Japanese beancurd with minced chicken in spicy chili sauce, claypot",price:88000,disabled:false},
        {id:"sp-cp-03",name:"Sapo Ikan Halibut Bawang Bombay Teriyaki",desc:"Pan fried halibut fillet with white onion in teriyaki sauce, served in claypot",price:118000,disabled:false},
        {id:"sp-cp-04",name:"Hot Plate Pocay Tofu Siram Udang Cincang",desc:"Hot plate/hot stone Horenso beancurd braised with minced prawn",price:98000,disabled:false},
        {id:"sp-cp-05",name:"Sapo Angsio Hoisom, Hipio & Jamur Hitam",desc:"Braised sea cucumber Hipio, black mushroom & seasonal vegetables, claypot",price:108000,disabled:false},
        {id:"sp-cp-06",name:"Sapo Tahu Sari Laut Saus XO",desc:"Stewed beancurd with seafood and XO sauce in claypot",price:108000,disabled:false},
      ]},
      {id:"sp-meat",name:"Sapi / Ayam / Bebek / Kambing 牛-雞-鸭-羊",items:[
        {id:"sp-m-01",name:"Bistik Sapi Impor & Skalop Lada Hitam (Perorangan)",desc:"Pan fried premium beef and crispy scallop in black pepper sauce",price:118000,disabled:false},
        {id:"sp-m-02",name:"Bistik Sapi Impor Saus Kanton & Bawang Bombay",desc:"Pan fried Aust slice beef with white onion in Cantonese style",price:108000,disabled:false},
        {id:"sp-m-03",name:"Sapi Impor Tenderloin Lada Hitam & Paprika",desc:"Pan fried premium beef tenderloin, mixed capsicum, black pepper sauce",price:118000,disabled:false},
        {id:"sp-m-04",name:"Ayam Goreng Tanpa Tulang Madu Jahe & Jeruk Bali",desc:"Honey glazed boneless chicken topped with crispy ginger flakes and pomelo",price:78000,disabled:false},
        {id:"sp-m-05",name:"Ayam Goreng Saus Cabai Sichuan",desc:"Fried chicken village with Sichuan chili",price:98000,disabled:false},
        {id:"sp-m-06",name:"Ayam Goreng Saus Asam Manis & Nanas",desc:"Deep fried chicken fillet with pineapple in sweet and sour sauce",price:78000,disabled:false},
        {id:"sp-m-07",name:"Ayam Goreng Sereh A la Summer Palace",desc:"Summer Palace deep fried crispy chicken with lemongrass",price:178000,disabled:false},
        {id:"sp-m-08",name:"Ayam Goreng Saus Lemon",desc:"Deep fried old style lemon chicken fillet",price:78000,disabled:false},
        {id:"sp-m-09",name:"Ayam Kungpao",desc:"Chicken Gunpao / Kungpao",price:78000,disabled:false},
        {id:"sp-m-10",name:"Ayam Teriyaki Bawang Jepang",desc:"Chicken teriyaki with Japanese onion sauce",price:78000,disabled:false},
      ]},
      {id:"sp-vegetables",name:"Sayuran 蔬菜",items:[
        {id:"sp-veg-01",name:"Tumis Buncis Sapi Cincang & Ebi",desc:"Sauteed baby French bean with dry shrimp and minced beef",price:68000,disabled:false},
        {id:"sp-veg-02",name:"Kailan Hong Kong Dua Rasa",desc:"Hong Kong Kailan 2 flavors (garlic / salt & pepper)",price:68000,disabled:false},
        {id:"sp-veg-03",name:"Pocay Tiga Macam Telur, Ikan Teri Perak & Skalop Kering",desc:"Boiled Horenso with three kinds egg, fried silverfish Perak and dry scallop",price:78000,disabled:false},
        {id:"sp-veg-04",name:"Brokoli / Bayam Jepang / Sawi Tumis Bawang Putih",desc:"Sauteed broccoli/horenso/pok choy with golden garlic",price:58000,disabled:false},
        {id:"sp-veg-05",name:"Asparagus Tumis Saus XO & Jamur Shimeji",desc:"Sauteed asparagus with XO sauce and Shimeji mushroom",price:78000,disabled:false},
        {id:"sp-veg-06",name:"Baby Kailan Tumis Ebi & Sambal Belacan",desc:"Sauteed balachan with dry shrimp and baby kailan",price:58000,disabled:false},
        {id:"sp-veg-07",name:"Tumis Bayam Jepang (Horenso) Bawang Putih",desc:"Stir fry Horenso with minced garlic",price:58000,disabled:false},
        {id:"sp-veg-08",name:"Tumis Brokoli Bawang Putih",desc:"Stir fry broccoli with minced garlic",price:58000,disabled:false},
      ]},
      {id:"sp-tofu",name:"Tahu / Bean Curd 豆腐",items:[
        {id:"sp-tf-01",name:"Tahu Isi Udang Saus Tiram",desc:"Tofu filled with shrimp served with oyster sauce",price:78000,disabled:false},
        {id:"sp-tf-02",name:"Kepiting & Jamur Shimeji Siram Tahu Bayam Jepang",desc:"Braised homemade beancurd Horenso with crab meat & Shimeji mushroom",price:78000,disabled:false},
        {id:"sp-tf-03",name:"Mapo Tofu Sapi Cincang Sichuan",desc:"Braised Mapo beancurd with minced beef in Sichuan style",price:68000,disabled:false},
      ]},
      {id:"sp-noodle-rice",name:"Mie / Nasi 面-饭",items:[
        {id:"sp-nr-01",name:"Kwetiau Arang Goreng Sapi & Saus XO",desc:"Wok fried charcoal rice noodle with XO sauce & shredded beef",price:88000,disabled:false},
        {id:"sp-nr-02",name:"Mie Kuning Hokkian Udang & Ayam",desc:"Home style Hokkian yellow noodle with prawn & chicken",price:88000,disabled:false},
        {id:"sp-nr-03",name:"Ifu Mie Siram Sari Laut & Telur Puyuh",desc:"Braised Ifu noodle seafood with vegetables & quail eggs",price:98000,disabled:false},
        {id:"sp-nr-04",name:"Mie Kuah Hong Kong Shui Kwie Udang",desc:"Hong Kong noodle soup with shrimp dumpling and vegetables",price:88000,disabled:false},
        {id:"sp-nr-05",name:"Mie Hong Kong Siram Ayam & Sayuran",desc:"Deep fried Hong Kong noodle with chicken & vegetables",price:88000,disabled:false},
        {id:"sp-nr-06",name:"Kwetiaw Goreng Sapi Saus XO",desc:"Wok fried rice noodles with XO sauce, shredded beef",price:88000,disabled:false},
        {id:"sp-nr-07",name:"Mie Goreng Chinese Ayam & Udang",desc:"Chinese fried noodles with chicken and shrimps",price:88000,disabled:false},
        {id:"sp-nr-08",name:"Suun Goreng Sari Laut",desc:"Wok fried glass noodle (suún) with seafood",price:88000,disabled:false},
        {id:"sp-nr-09",name:"I Fu Mie Goreng Sari Laut & Telur Puyuh",desc:"Wok fried E-Fu noodles with seafood and quail egg",price:88000,disabled:false},
        {id:"sp-nr-10",name:"Nasi Goreng Hati Angsa & Kepiting A la Summer Palace",desc:"Summer Palace diced goose liver fried rice with crab meat and spring onion",price:128000,disabled:false},
        {id:"sp-nr-11",name:"Nasi Goreng Yong Zhou",desc:"\"Yong Zhou\" fried rice",price:78000,disabled:false},
        {id:"sp-nr-12",name:"Nasi Goreng Ayam Ikan Asin & Ikan Teri",desc:"Chicken fried rice with salted fish and silver fish",price:78000,disabled:false},
        {id:"sp-nr-13",name:"Nasi Kriuk Sari Laut Kaldu Lobster",desc:"Poached seafood rice in lobster broth served with crispy rice",price:128000,disabled:false},
        {id:"sp-nr-14",name:"Nasi Goreng Kepiting, Skalop Kering & Putih Telur",desc:"Crab meat fried rice with dried scallop & egg white",price:118000,disabled:false},
        {id:"sp-nr-15",name:"Nasi Goreng Sari Laut Saus XO",desc:"Seafood fried rice with XO sauce",price:88000,disabled:false},
      ]},
      {id:"sp-dessert",name:"Hidangan Penutup 甜点",items:[
        {id:"sp-des-01",name:"Krim Mangga Sago, Lidah Buaya & Es Puter Stroberi",desc:"Chilled mango sago cream with aloe vera strawberry sorbet",price:33800,disabled:false},
        {id:"sp-des-02",name:"Krim Kacang Almond & Ronde (Panas)",desc:"Hot almond cream with glutinous rice ball",price:33800,disabled:false},
        {id:"sp-des-03",name:"Gui Ling Gao dengan Madu",desc:"Chilled Gui Ling Gao with wild honey",price:33800,disabled:false},
        {id:"sp-des-04",name:"Puding Pepaya",desc:"Papaya pudding",price:33800,disabled:false},
        {id:"sp-des-05",name:"Puding Kelapa, Saus Vanila & Daun Mint",desc:"Chilled coconut pudding with vanilla ice cream topped with mint leaf",price:33800,disabled:false},
        {id:"sp-des-06",name:"Onde-onde Hitam (Goreng Wijen)",desc:"Deep fried glutinous rice ball with black sesame",price:35800,disabled:false},
      ]},
    ]
  },
,
  // ─── BAKPIA PATHOK 25 ────────────────────────────────────────────────────────
  {
    id:"bakpia",name:"Bakpia Pathok 25",subtitle:"D4 · Oleh-oleh Takeaway · 5 Juli 2026",
    note:"Bakpia Pathok 25, Yogyakarta · 23 pax · Dikoordinir, bayar langsung 5 Juli",
    deadline:"30 Juni 2026",
    isTakeaway:true,
    participants: ALL_PAX,
    categories:[
      {id:"bp-premium",name:"Premium (Bakpia Basah) — IDR 75.000 / kotak",items:[
        {id:"bp-pre-kh",  name:"Premium Kacang Hijau", desc:"Bakpia Basah · 15 biji · 525g · Simpan 4–5 hari",  price:75000},
        {id:"bp-pre-kumbu",name:"Premium Kumbu",        desc:"Bakpia Basah · 15 biji · 525g · Simpan 4–5 hari",  price:75000},
        {id:"bp-pre-keju",name:"Premium Keju",          desc:"Bakpia Basah · 15 biji · 525g · Simpan 6–7 hari",  price:75000},
        {id:"bp-pre-nas", name:"Premium Nanas",         desc:"Bakpia Basah · 15 biji · 525g · Simpan 4–5 hari",  price:75000},
        {id:"bp-pre-cok", name:"Premium Cokelat",       desc:"Bakpia Basah · 15 biji · 525g · Simpan 6–7 hari",  price:75000},
        {id:"bp-pre-sus", name:"Premium Susu",          desc:"Bakpia Basah · 15 biji · 525g · Simpan 4–5 hari",  price:75000},
        {id:"bp-pre-telo",name:"Premium Telo Ungu",     desc:"Bakpia Basah · 15 biji · 525g · Simpan 4–5 hari",  price:75000},
        {id:"bp-pre-cap", name:"Premium Capuccino",     desc:"Bakpia Basah · 15 biji · 525g · Simpan 4–5 hari",  price:75000},
        {id:"bp-pre-dur", name:"Premium Durian",        desc:"Bakpia Basah · 15 biji · 525g · Simpan 4–5 hari",  price:75000},
        {id:"bp-pre-gt",  name:"Premium Green Tea",     desc:"Bakpia Basah · 15 biji · 525g · Simpan 4–5 hari",  price:75000},
      ]},
      {id:"bp-original",name:"Original (Bakpia Kering) — IDR 51.000 / kotak",items:[
        {id:"bp-ori-kh",  name:"Original Kacang Hijau",desc:"Bakpia Basah · 15 biji · 450g · Simpan 4–5 hari",   price:51000},
        {id:"bp-ori-keju",name:"Original Keju",         desc:"Bakpia Kering · 15 biji · 375g · Simpan 8–10 hari", price:51000},
        {id:"bp-ori-cok", name:"Original Cokelat",      desc:"Bakpia Kering · 15 biji · 375g · Simpan 8–10 hari", price:51000},
        {id:"bp-ori-nas", name:"Original Nanas",        desc:"Bakpia Kering · 15 biji · 375g · Simpan 8–10 hari", price:51000},
        {id:"bp-ori-mix", name:"Original Aneka Rasa",   desc:"Bakpia Kering · Mix Keju-Cokelat-Nanas · 15 biji · 375g · Simpan 8–10 hari", price:51000},
      ]},
    ]
  },
,
  // ─── JUWARA SATOE ─────────────────────────────────────────────────────────────
  {
    id:"juwara",name:"Juwara Satoe",subtitle:"D4 · Oleh-oleh Takeaway · 5 Juli 2026",
    note:"Bakpia Juwara Satoe, Yogyakarta · 23 pax · Dikoordinir, bayar langsung 5 Juli",
    deadline:"30 Juni 2026",
    isTakeaway:true,
    participants: ALL_PAX,
    categories:[
      {id:"js-bb",name:"Bakpia Basah",items:[
        {id:"js-bb-kh",    name:"Kacang Hijau",    desc:"Bakpia Basah · isi 15 pcs",           price:20000},
        {id:"js-bb-kumbu", name:"Kumbu Hitam",     desc:"Bakpia Basah · isi 15 pcs",           price:20000},
        {id:"js-bb-cok",   name:"Coklat",          desc:"Bakpia Basah · isi 15 pcs",           price:25000},
        {id:"js-bb-keju",  name:"Keju",            desc:"Bakpia Basah · isi 15 pcs",           price:25000},
        {id:"js-bb-kk",    name:"Kit Kat",         desc:"Bakpia Basah · isi 5 pcs",            price:25000},
        {id:"js-bb-dur",   name:"Durian",          desc:"Bakpia Basah · isi 15 pcs",           price:30000},
        {id:"js-bb-cokkeju",name:"Coklat Keju",   desc:"Bakpia Basah · isi 15 pcs",           price:30000},
        {id:"js-bb-nas",   name:"Nanas",           desc:"Bakpia Basah · isi 15 pcs",           price:30000},
        {id:"js-bb-mix",   name:"Mix",             desc:"Bakpia Basah · isi 24 pcs",           price:45000},
      ]},
      {id:"js-premium",name:"Premium Series ★",items:[
        {id:"js-pr-pb",  name:"Peanut Butter ★ NEW", desc:"Bakpia Basah Premium · isi 15 pcs", price:39000},
        {id:"js-pr-ovo", name:"Ovomaltine ★ NEW",    desc:"Bakpia Basah Premium · isi 12 pcs", price:45000},
      ]},
      {id:"js-bk",name:"Bakpia Kering",items:[
        {id:"js-bk-khori", name:"Kacang Hijau Ori",  desc:"Bakpia Kering · isi 10 pcs",        price:20000},
        {id:"js-bk-khasin",name:"Kacang Hijau Asin", desc:"Bakpia Kering · isi 10 pcs",        price:25000},
        {id:"js-bk-pan",   name:"Pandan",             desc:"Bakpia Kering · isi 10 pcs",        price:25000},
        {id:"js-bk-keju",  name:"Keju",               desc:"Bakpia Kering · isi 10 pcs",        price:30000},
        {id:"js-bk-gula",  name:"Gula Tarik",         desc:"Bakpia Kering · isi 10 pcs",        price:30000},
        {id:"js-bk-cok",   name:"Coklat",             desc:"Bakpia Kering · isi 10 pcs",        price:30000},
        {id:"js-bk-sambal",name:"Mini Sambal",        desc:"Bakpia Kering · isi 16 pcs",        price:30000},
        {id:"js-bk-nastar",name:"Nastar",             desc:"Bakpia Kering · isi 10 pcs",        price:30000},
        {id:"js-bk-sesame",name:"Black Sesame",       desc:"Bakpia Kering · isi 10 pcs",        price:30000},
        {id:"js-bk-happy", name:"Happy Package",      desc:"Bakpia Kering · isi 20 pcs",        price:45000},
      ]},
      {id:"js-bln",name:"Bakpia Bulan",items:[
        {id:"js-bln-khori",  name:"Kacang Hijau Ori",          desc:"Bakpia Bulan · isi 6 pcs",  price:30000},
        {id:"js-bln-kumbu",  name:"Kumbu Hitam Ori",           desc:"Bakpia Bulan · isi 6 pcs",  price:30000},
        {id:"js-bln-mix",    name:"Mix",                       desc:"Bakpia Bulan · isi 6 pcs",  price:35000},
        {id:"js-bln-cokkeju",name:"Coklat Kacang Keju ★ NEW",desc:"Bakpia Bulan · isi 6 pcs",price:40000},
        {id:"js-bln-khts",   name:"Kacang Hijau Telur Asin",   desc:"Bakpia Bulan · isi 6 pcs",  price:40000},
        {id:"js-bln-kumts",  name:"Kumbu Hitam Telur Asin",    desc:"Bakpia Bulan · isi 6 pcs",  price:40000},
      ]},
      {id:"js-nr",name:"Nastar Roll ★ Premium Quality",items:[
        {id:"js-nr-ori15", name:"Original (15 pcs)",         desc:"Nastar Roll · isi 15 pcs",   price:45000},
        {id:"js-nr-ori30", name:"Original (30 pcs)",         desc:"Nastar Roll · isi 30 pcs",   price:85000},
        {id:"js-nr-cok15", name:"Coklat (15 pcs)",           desc:"Nastar Roll · isi 15 pcs",   price:45000},
        {id:"js-nr-cok30", name:"Coklat (30 pcs)",           desc:"Nastar Roll · isi 30 pcs",   price:85000},
        {id:"js-nr-kj15",  name:"Keju Kastengel (15 pcs)",   desc:"Nastar Roll · isi 15 pcs",   price:52000},
        {id:"js-nr-kj30",  name:"Keju Kastengel (30 pcs)",   desc:"Nastar Roll · isi 30 pcs",   price:95000},
        {id:"js-nr-jumbo", name:"Nastar Jumbo",              desc:"Nastar Roll · isi 5 pcs",    price:30000},
      ]},
      {id:"js-ck",name:"Cookies",items:[
        {id:"js-ck-kacang",name:"Kue Kacang",        desc:"Cookies · isi 6 pcs",               price:15000},
        {id:"js-ck-choco", name:"Choco Mete Cookies",desc:"Cookies · isi 6 pcs",               price:20000},
      ]},
      {id:"js-bl",name:"Bluder Butter",items:[
        {id:"js-bl-ori",   name:"Ori",               desc:"Bluder Butter · per pcs",            price:10000},
        {id:"js-bl-kismis",name:"Kismis",            desc:"Bluder Butter · per pcs",            price:12000},
        {id:"js-bl-keju",  name:"Keju",              desc:"Bluder Butter · per pcs",            price:12000},
        {id:"js-bl-cok",   name:"Coklat",            desc:"Bluder Butter · per pcs",            price:12000},
        {id:"js-bl-kh",    name:"Kacang Hijau ★ NEW",desc:"Bluder Butter · per pcs",       price:12000},
        {id:"js-bl-lotus", name:"Lotus Biscoff",     desc:"Bluder Butter · per pcs",            price:16000},
      ]},
    ]
  },
,
  // ─── WAHYU AUSTIN PASTRY ──────────────────────────────────────────────────────
  {
    id:"wahyu-austin",name:"Wahyu Austin Pastry",subtitle:"D4 · Oleh-oleh Takeaway · 5 Juli 2026",
    note:"Roll Cake 4×30 cm · 23 pax · Dikoordinir, bayar langsung 5 Juli",
    deadline:"30 Juni 2026",
    isTakeaway:true,
    participants: ALL_PAX,
    categories:[
      {id:"wa-rollcake",name:"Roll Cake — IDR 100.000 / roll (4×30 cm)",items:[
        {id:"wa-rc-blueberry",  name:"Blueberry",  desc:"Roll Cake · 4×30 cm · Wahyu Austin Pastry", price:100000},
        {id:"wa-rc-cheese",     name:"Cheese",     desc:"Roll Cake · 4×30 cm · Wahyu Austin Pastry", price:100000},
        {id:"wa-rc-chocolate",  name:"Chocolate",  desc:"Roll Cake · 4×30 cm · Wahyu Austin Pastry", price:100000},
        {id:"wa-rc-greentea",   name:"Green Tea",  desc:"Roll Cake · 4×30 cm · Wahyu Austin Pastry", price:100000},
        {id:"wa-rc-nougat",     name:"Nougat",     desc:"Roll Cake · 4×30 cm · Wahyu Austin Pastry", price:100000},
        {id:"wa-rc-opera",      name:"Opera",      desc:"Roll Cake · 4×30 cm · Wahyu Austin Pastry", price:100000},
        {id:"wa-rc-orange",     name:"Orange",     desc:"Roll Cake · 4×30 cm · Wahyu Austin Pastry", price:100000},
      ]},
    ]
  },
];

// ── PATCH 1: Tentrem Summer Palace removed from UPCOMING_FB ─────────────────
const UPCOMING_FB = [
  {name:"Kemangi",day:"D1",meal:"Welcome Dinner",sponsor:"Gerard Sahat"},
  {name:"Mbah Mo",day:"D2",meal:"Makan Siang",sponsor:"Monang Panjaitan"},
  {name:"Desa Palagan",day:"D3",meal:"Sarapan",sponsor:"Agustinus Tambunan"},
  {name:"Djiwana",day:"D3",meal:"Makan Siang",sponsor:"Agustinus Tambunan"},
];

const fmt = n => "IDR " + Math.abs(Number(n)).toLocaleString("id-ID");
const pct = (a,b) => b>0?Math.min(100,Math.round((a/b)*100)):0;

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${T.stone}; font-family: 'Jost', sans-serif; font-weight: 300; color: ${T.ink}; -webkit-font-smoothing: antialiased; }
    ::selection { background: ${T.forest}; color: white; }
    input, select, button, textarea { font-family: 'Jost', sans-serif; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    .fade-up { animation: fadeUp 0.6s ease forwards; }
  `}</style>
);

const PasswordScreen = memo(({onSuccess}) => {
  const [val,setVal] = useState(""); const [err,setErr] = useState(false); const inputRef = useRef();
  const submit = () => val===PASSWORD ? onSuccess() : (setErr(true), setVal(""), inputRef.current?.focus());
  return (
    <div style={{minHeight:"100vh",background:T.stone,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <GlobalStyles/>
      <div className="fade-up" style={{width:"100%",maxWidth:"400px",textAlign:"center"}}>
        <p style={{fontSize:"10px",letterSpacing:"4px",textTransform:"uppercase",color:T.muted,marginBottom:"32px"}}>Yogyakarta · 2–5 Juli 2026</p>
        <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"42px",fontWeight:400,color:T.ink,marginBottom:"8px",letterSpacing:"-0.5px",lineHeight:1.1}}>Pomp Op Sahat</h1>
        <p style={{fontSize:"12px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"56px"}}>Hyatt Regency Yogyakarta</p>
        <div style={{marginBottom:err?"8px":"24px"}}>
          <input ref={inputRef} type="password" value={val} onChange={e=>{setVal(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&submit()}
            placeholder="Kata sandi" style={{width:"100%",padding:"16px 0",borderTop:"none",borderLeft:"none",borderRight:"none",borderBottom:`1px solid ${err?T.danger:T.lineD}`,background:"transparent",fontSize:"14px",letterSpacing:"1px",color:T.ink,outline:"none",textAlign:"center"}} />
        </div>
        {err && <p style={{fontSize:"11px",color:T.danger,letterSpacing:"1px",marginBottom:"16px",textTransform:"uppercase"}}>Kata sandi tidak tepat</p>}
        <button onClick={submit} style={{background:"none",border:"none",cursor:"pointer",fontSize:"11px",letterSpacing:"3px",textTransform:"uppercase",color:T.forest,padding:"12px 0",fontWeight:500,borderBottom:`1px solid ${T.forest}`}}>Masuk</button>
        <p style={{marginTop:"48px",fontSize:"10px",color:T.ghost,letterSpacing:"1px"}}>Hubungi koordinator untuk kata sandi</p>
      </div>
    </div>
  );
});

const NameScreen = memo(({onSuccess}) => {
  const [sel,setSel] = useState("");
  return (
    <div style={{minHeight:"100vh",background:T.stone,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
      <GlobalStyles/>
      <div className="fade-up" style={{width:"100%",maxWidth:"400px",textAlign:"center"}}>
        <p style={{fontSize:"10px",letterSpacing:"4px",textTransform:"uppercase",color:T.muted,marginBottom:"32px"}}>Selamat datang</p>
        <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"36px",fontWeight:400,color:T.ink,marginBottom:"48px"}}>Siapa Anda?</h2>
        <select value={sel} onChange={e=>setSel(e.target.value)} style={{width:"100%",padding:"16px 0",border:"none",borderBottom:`1px solid ${T.lineD}`,background:"transparent",fontSize:"14px",color:sel?T.ink:T.muted,outline:"none",cursor:"pointer",appearance:"none",textAlign:"center"}}>
          <option value="">Pilih nama Anda</option>
          {ALL_PAX.map(p=><option key={p.name} value={p.name}>{p.name} — {p.hh}</option>)}
        </select>
        <div style={{marginTop:"40px"}}>
          <button onClick={()=>sel&&onSuccess(sel)} disabled={!sel} style={{background:"none",border:"none",cursor:sel?"pointer":"default",fontSize:"11px",letterSpacing:"3px",textTransform:"uppercase",color:sel?T.forest:T.ghost,padding:"12px 0",fontWeight:500,borderBottom:`1px solid ${sel?T.forest:T.ghost}`,transition:"all 0.2s"}}>Lanjutkan</button>
        </div>
      </div>
    </div>
  );
});

const Shell = ({user,tab,setTab,children}) => {
  const TABS = [{id:"budget",label:"Dana"},{id:"itinerary",label:"Itinerary"},{id:"food",label:"Pre-Order F&B"}];
  return (
    <div style={{minHeight:"100vh",background:T.stone}}>
      <GlobalStyles/>
      <header style={{background:T.stone,borderBottom:`1px solid ${T.line}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:"960px",margin:"0 auto",padding:"0 40px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0 16px",borderBottom:`1px solid ${T.line}`}}>
            <div>
              <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"22px",fontWeight:400,color:T.ink,letterSpacing:"-0.3px"}}>Pomp Op Sahat</h1>
              <p style={{fontSize:"10px",letterSpacing:"2.5px",textTransform:"uppercase",color:T.muted,marginTop:"3px"}}>Yogyakarta · Hyatt Regency · 2–5 Juli 2026 · 23 Peserta</p>
            </div>
            <p style={{fontSize:"11px",color:T.muted}}>Halo, <span style={{color:T.ink,fontWeight:500}}>{user}</span></p>
          </div>
          <nav style={{display:"flex"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",padding:"16px 28px 14px",cursor:"pointer",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",fontWeight:tab===t.id?500:300,color:tab===t.id?T.forest:T.muted,borderBottom:tab===t.id?`2px solid ${T.forest}`:"2px solid transparent",transition:"all 0.2s",marginBottom:"-1px"}}>{t.label}</button>
            ))}
          </nav>
        </div>
      </header>
      <main style={{maxWidth:"960px",margin:"0 auto",padding:"60px 40px"}}>{children}</main>
      <footer style={{borderTop:`1px solid ${T.line}`,padding:"32px 40px",textAlign:"center"}}>
        <p style={{fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:T.ghost}}>Konfidensial · Pomp Op Sahat 2026 · Yogyakarta</p>
      </footer>
    </div>
  );
};

const BudgetTab = memo(({user}) => {
  const isCoord = COORDINATORS.includes(user);
  const myHH = ALL_PAX.find(p=>p.name===user)?.hh;
  const [d, setD] = useState(BUDGET_DEFAULT);
  const [syncedAt, setSyncedAt] = useState(null);
  const [ledger, setLedger] = useState([]);

  useEffect(() => {
    const toArr = v => !v ? [] : Array.isArray(v) ? v : Object.values(v);
    const unsubBudget = onValue(ref(db, "budget"), snap => {
      if (snap.exists()) {
        const val = snap.val();
        const merged = {
          ...BUDGET_DEFAULT,
          ...val,
          totals: { ...BUDGET_DEFAULT.totals, ...(val.totals || {}) },
        };
        merged.households = toArr(merged.households).map(hh => ({
          ...hh,
          members: toArr(hh.members),
          subRows: toArr(hh.subRows),
        }));
        setD(merged);
        setSyncedAt(new Date());
      }
    });
    const unsubLedger = onValue(ref(db, "ledger"), snap => {
      if (snap.exists()) {
        const val = snap.val();
        setLedger(Array.isArray(val) ? val : Object.values(val));
      }
    });
    return () => { unsubBudget(); unsubLedger(); };
  }, []);

  const collection = pct(d.totals.deposit, d.totals.gross);

  return (
    <div className="fade-up">
      <div style={{marginBottom:"56px"}}>
        <p style={{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"12px"}}>Dana Bersama</p>
        <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"34px",fontWeight:400,color:T.ink,marginBottom:"8px"}}>Ringkasan Keuangan</h2>
        <p style={{fontSize:"12px",color:T.muted}}>Per {d.lastSync} · Data dari Lusiana{syncedAt && <span style={{color:T.ghost}}> · Live {syncedAt.toLocaleTimeString("id-ID")}</span>}</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1px",background:T.line,marginBottom:"64px"}}>
        {[
          {label:"Total Dana",val:fmt(d.totals.gross),sub:"Dana bersama"},
          {label:"Per Peserta",val:fmt(d.perPax),sub:"Kontribusi"},
          {label:"Terkumpul",val:fmt(d.totals.deposit),sub:`${collection}% dari target`,hi:T.settled},
          {label:"Belum Lunas",val:fmt(Math.max(0,-d.totals.balance)),sub:"Outstanding",hi:d.totals.balance<0?T.danger:T.settled},
        ].map(k=>(
          <div key={k.label} style={{background:T.cream,padding:"32px 28px"}}>
            <p style={{fontSize:"10px",letterSpacing:"2.5px",textTransform:"uppercase",color:T.muted,marginBottom:"16px"}}>{k.label}</p>
            <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"26px",fontWeight:400,color:k.hi||T.ink,lineHeight:1,marginBottom:"8px"}}>{k.val}</p>
            <p style={{fontSize:"11px",color:T.muted}}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div style={{marginBottom:"64px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"12px"}}>
          <p style={{fontSize:"10px",letterSpacing:"2.5px",textTransform:"uppercase",color:T.muted}}>Tingkat Pelunasan</p>
          <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"22px",color:T.ink}}>{collection}%</p>
        </div>
        <div style={{height:"1px",background:T.line,position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,height:"2px",width:`${collection}%`,background:T.forest,marginTop:"-0.5px",transition:"width 1s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:"8px"}}>
          <p style={{fontSize:"10px",color:T.muted}}>Terkumpul: {fmt(d.totals.deposit)}</p>
          <p style={{fontSize:"10px",color:T.muted}}>Target: {fmt(d.totals.gross)}</p>
        </div>
      </div>

      <div style={{marginBottom:"64px"}}>
        <p style={{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"32px"}}>Posisi Per Household</p>
        <div style={{borderTop:`1px solid ${T.line}`}}>
          {d.households.map(hh=>{
            const isOwn=hh.id===myHH, absorbed=hh.absorbed;
            const settled=!absorbed&&hh.balance>=0;
            const statusColor=absorbed?T.abs:settled?T.settled:T.danger;
            const statusLabel=absorbed?"Absorbed":settled?"Settled":hh.deposit>0?"Belum Lunas":"Belum Bayar";
            const show=isCoord||isOwn||settled;
            return (
              <div key={hh.id} style={{borderBottom:`1px solid ${T.line}`,padding:"32px 0",position:"relative"}}>
                {isOwn&&<div style={{position:"absolute",left:"-40px",top:0,bottom:0,width:"2px",background:T.gold}}/>}
                <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"24px",alignItems:"start"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"6px",flexWrap:"wrap"}}>
                      <h3 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"20px",fontWeight:400,color:T.ink}}>{hh.lead}</h3>
                      {isOwn&&<span style={{fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:T.gold,border:`1px solid ${T.gold}`,padding:"2px 8px"}}>Anda</span>}
                    </div>
                    <p style={{fontSize:"11px",color:T.muted,marginBottom:show&&!absorbed?"20px":"0"}}>{hh.id} · {hh.pax} peserta · {hh.members.join(", ")}</p>
                    {show&&!absorbed&&(
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,160px)",gap:"24px"}}>
                        {[
                          {l:"Total",v:fmt(hh.gross),c:T.ink},
                          {l:"Dibayar",v:fmt(hh.deposit),c:T.settled},
                          {l:hh.balance>=0?"Credit":"Sisa Bayar",v:fmt(Math.abs(hh.balance)),c:hh.balance>=0?T.settled:T.danger},
                        ].map(f=>(
                          <div key={f.l}>
                            <p style={{fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"6px"}}>{f.l}</p>
                            <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"18px",color:f.c,fontWeight:400}}>{f.v}</p>
                            {hh.gross>0&&f.l==="Dibayar"&&<div style={{marginTop:"6px",height:"1px",background:T.line}}><div style={{height:"1px",width:`${pct(hh.deposit,hh.gross)}%`,background:T.settled}}/></div>}
                          </div>
                        ))}
                      </div>
                    )}
                    {isCoord&&hh.id==="HH4"&&hh.subRows?.length>0&&(
                      <div style={{marginTop:"20px",borderTop:`1px solid ${T.line}`,paddingTop:"16px"}}>
                        <p style={{fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"12px"}}>Sub-unit HH4</p>
                        {hh.subRows.map((s,i)=>(
                          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 60px 120px 100px",gap:"16px",padding:"8px 0",borderBottom:`1px solid ${T.line}`,fontSize:"12px",alignItems:"center"}}>
                            <span style={{color:T.mid}}>{s.members}</span>
                            <span style={{color:T.muted,textAlign:"right"}}>{s.pax}px</span>
                            <span style={{color:T.settled,textAlign:"right"}}>{fmt(s.deposit)}</span>
                            <span style={{color:s.balance>=0?T.settled:T.danger,textAlign:"right",fontWeight:500}}>{s.balance>=0?"+":""}{fmt(s.balance)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {absorbed&&<p style={{fontSize:"11px",color:T.abs,fontStyle:"italic",marginTop:"4px"}}>{hh.note}</p>}
                    {!show&&!absorbed&&<p style={{fontSize:"11px",color:T.muted,fontStyle:"italic",marginTop:"4px"}}>Detail hanya tersedia untuk household Anda.</p>}
                  </div>
                  <p style={{fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:statusColor,fontWeight:500,marginTop:"4px",whiteSpace:"nowrap"}}>{statusLabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{marginBottom:"64px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"32px"}}>
          <p style={{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted}}>Riwayat Transaksi</p>
          {syncedAt&&<p style={{fontSize:"10px",color:T.ghost}}>Live · {syncedAt.toLocaleTimeString("id-ID")}</p>}
        </div>
        {ledger.length===0
          ? <p style={{fontSize:"12px",color:T.muted,fontStyle:"italic"}}>Memuat data transaksi…</p>
          : <>
            <div style={{display:"grid",gridTemplateColumns:"32px 100px 80px 1fr 120px 120px 130px",gap:"0 16px",padding:"0 0 10px",borderBottom:`2px solid ${T.line}`}}>
              {["No","Tanggal","Tipe","Keterangan","Deposit (+)","Refund (−)","Saldo"].map(h=>(
                <p key={h} style={{fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,textAlign:["Deposit (+)","Refund (−)","Saldo"].includes(h)?"right":"left"}}>{h}</p>
              ))}
            </div>
            {ledger.map((row,i)=>{
              const isDeposit = row.tipe==="Deposit";
              const isRefund  = row.tipe==="Refund";
              const typeColor = isDeposit ? T.settled : isRefund ? T.warn : T.danger;
              return (
                <div key={i} style={{display:"grid",gridTemplateColumns:"32px 100px 80px 1fr 120px 120px 130px",gap:"0 16px",padding:"13px 0",borderBottom:`1px solid ${T.line}`,alignItems:"center"}}>
                  <p style={{fontSize:"11px",color:T.ghost}}>{row.no}</p>
                  <p style={{fontSize:"11px",color:T.muted}}>{row.tanggal}</p>
                  <p style={{fontSize:"10px",letterSpacing:"1px",textTransform:"uppercase",color:typeColor,fontWeight:500}}>{row.tipe}</p>
                  <div>
                    <p style={{fontSize:"12px",color:T.ink}}>{row.keterangan}</p>
                    {row.note&&<p style={{fontSize:"10px",color:T.ghost,marginTop:"2px",fontStyle:"italic"}}>{row.note}</p>}
                  </div>
                  <p style={{fontSize:"12px",color:row.deposit>0?T.settled:T.ghost,textAlign:"right",fontFamily:"'Playfair Display',Georgia,serif"}}>{row.deposit>0?`+${fmt(row.deposit)}`:"—"}</p>
                  <p style={{fontSize:"12px",color:row.refund>0?T.warn:T.ghost,textAlign:"right",fontFamily:"'Playfair Display',Georgia,serif"}}>{row.refund>0?`−${fmt(row.refund)}`:"—"}</p>
                  <p style={{fontSize:"13px",color:T.ink,textAlign:"right",fontFamily:"'Playfair Display',Georgia,serif",fontWeight:i===ledger.length-1?500:400}}>{fmt(row.saldo)}</p>
                </div>
              );
            })}
            <div style={{display:"grid",gridTemplateColumns:"32px 100px 80px 1fr 120px 120px 130px",gap:"0 16px",padding:"16px 0 0",borderTop:`2px solid ${T.lineD}`,marginTop:"4px"}}>
              <span/><span/><span/>
              <p style={{fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted}}>Saldo Kas</p>
              <span/><span/>
              <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"18px",color:T.forest,textAlign:"right",fontWeight:500}}>{ledger.length>0?fmt(ledger[ledger.length-1].saldo):"—"}</p>
            </div>
          </>
        }
      </div>

      <div style={{borderTop:`1px solid ${T.line}`,paddingTop:"32px"}}>
        <p style={{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"16px"}}>Catatan</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 40px"}}>
          {["Dana Bersama mencakup Transportasi, Aktivitas (Jeep, Nuvantara) & Merchandise.",
            "F&B seluruhnya disponsori per household — tidak termasuk di sini.",
            "Hotel & tiket Garuda diselesaikan mandiri per household.",
            "HH5 (Mariana, Olive, Nadia) diserap oleh HH2 + HH3 + HH4.",
          ].map((n,i)=><p key={i} style={{fontSize:"11px",color:T.muted,lineHeight:"1.7"}}>— {n}</p>)}
        </div>
        {isCoord&&<p style={{marginTop:"24px",fontSize:"11px"}}><a href="https://docs.google.com/spreadsheets/d/19vHRDue6attrpewZcFNBSq3g3UvxbalaWCog6v5x0d4/edit" target="_blank" rel="noopener noreferrer" style={{color:T.forest,textDecoration:"none",borderBottom:`1px solid ${T.forest}`}}>Buka Google Sheets Lusiana ↗</a></p>}
      </div>
    </div>
  );
});

const TYPE_ICON = {assembly:"◉",train:"◈",arrival:"◉",departure:"◈",transport:"◇",dining:"◆",excursion:"◈",leisure:"◇"};
const TYPE_COLOR = {dining:T.forest,excursion:T.gold,arrival:T.settled,departure:T.settled};

const ItineraryTab = memo(() => {
  const [day,setDay] = useState(1);
  const d = ITINERARY.find(x=>x.day===day);
  return (
    <div className="fade-up">
      <div style={{marginBottom:"56px"}}>
        <p style={{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"12px"}}>Jadwal Perjalanan</p>
        <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"34px",fontWeight:400,color:T.ink}}>Itinerary v18</h2>
        <p style={{fontSize:"12px",color:T.muted,marginTop:"8px"}}>2–5 Juli 2026 · 23 Peserta · Hyatt Regency Yogyakarta</p>
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${T.line}`,marginBottom:"48px"}}>
        {ITINERARY.map(it=>(
          <button key={it.day} onClick={()=>setDay(it.day)} style={{background:"none",border:"none",padding:"0 32px 16px 0",cursor:"pointer",textAlign:"left"}}>
            <p style={{fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:day===it.day?T.forest:T.ghost,marginBottom:"4px"}}>{`Hari ${it.day}`}</p>
            <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"18px",color:day===it.day?T.forest:T.muted,fontWeight:day===it.day?500:400}}>{it.label}</p>
            {day===it.day&&<div style={{height:"2px",background:T.forest,marginTop:"14px",marginRight:"32px"}}/>}
          </button>
        ))}
      </div>
      {d&&<>
        <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"14px",fontStyle:"italic",color:T.muted,marginBottom:"40px"}}>{d.date}</p>
        <div style={{borderTop:`1px solid ${T.line}`}}>
          {d.events.map((ev,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"80px 20px 1fr",gap:"0 24px",borderBottom:`1px solid ${T.line}`,padding:"28px 0",alignItems:"start"}}>
              <div style={{textAlign:"right",paddingTop:"2px"}}>
                <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"16px",color:T.muted,fontStyle:"italic"}}>{ev.time}</p>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:"6px"}}>
                <span style={{fontSize:"14px",color:TYPE_COLOR[ev.type]||T.ghost,lineHeight:1}}>{TYPE_ICON[ev.type]||"◇"}</span>
                {i<d.events.length-1&&<div style={{flex:1,width:"1px",background:T.line,marginTop:"8px",minHeight:"20px"}}/>}
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"16px",flexWrap:"wrap"}}>
                  <h4 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"18px",fontWeight:400,color:T.ink}}>{ev.act}</h4>
                  {ev.sponsor&&<span style={{fontSize:"9px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.gold,whiteSpace:"nowrap",marginTop:"4px"}}>♡ {ev.sponsor}</span>}
                </div>
                <p style={{fontSize:"11px",color:T.muted,marginTop:"4px"}}>{ev.loc}</p>
                {ev.note&&<p style={{fontSize:"11px",color:T.muted,marginTop:"6px",fontStyle:"italic"}}>{ev.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
});

const FoodOrderTab = memo(({user}) => {
  const [view,setView] = useState("list");
  const [activeResto,setActiveResto] = useState(null);
  const isCoord = COORDINATORS.includes(user);

  if(view==="restaurant"&&activeResto) return <RestaurantView resto={activeResto} user={user} isCoord={isCoord} onBack={()=>{setView("list");setActiveResto(null);}}/>;

  return (
    <div className="fade-up">
      <div style={{marginBottom:"56px"}}>
        <p style={{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"12px"}}>Pemesanan Makanan</p>
        <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"34px",fontWeight:400,color:T.ink}}>Pre-Order F&B</h2>
        <p style={{fontSize:"12px",color:T.muted,marginTop:"8px"}}>Pilih restoran untuk melihat menu dan melakukan pemesanan</p>
      </div>
      <div style={{marginBottom:"56px"}}>
        <p style={{fontSize:"9px",letterSpacing:"3px",textTransform:"uppercase",color:T.forest,marginBottom:"24px",fontWeight:500}}>Pre-Order Tersedia</p>
        <div style={{borderTop:`1px solid ${T.line}`}}>
          {RESTAURANTS.map(r=>(
            <div key={r.id} onClick={()=>{setActiveResto(r);setView("restaurant");}}
              style={{display:"grid",gridTemplateColumns:"1fr auto",alignItems:"center",gap:"24px",borderBottom:`1px solid ${T.line}`,padding:"28px 0",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.cream}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"6px"}}>
                  <h3 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"20px",fontWeight:400,color:T.ink}}>{r.name}</h3>
                  <span style={{fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:T.settled,borderBottom:`1px solid ${T.settled}`}}>Terbuka</span>
                </div>
                <p style={{fontSize:"11px",color:T.muted}}>{r.subtitle}</p>
                <p style={{fontSize:"11px",color:T.muted,fontStyle:"italic",marginTop:"2px"}}>{r.note}</p>
              </div>
              <span style={{fontSize:"18px",color:T.muted}}>→</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p style={{fontSize:"9px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"24px"}}>F&B Lainnya</p>
        <div style={{borderTop:`1px solid ${T.line}`}}>
          {UPCOMING_FB.map(r=>(
            <div key={r.name} style={{display:"grid",gridTemplateColumns:"1fr auto",alignItems:"center",gap:"24px",borderBottom:`1px solid ${T.line}`,padding:"24px 0"}}>
              <div>
                <h4 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"17px",fontWeight:400,color:T.muted,marginBottom:"4px"}}>{r.name}</h4>
                <p style={{fontSize:"11px",color:T.ghost}}>{r.day} · {r.meal} · Sponsor: {r.sponsor}</p>
              </div>
              <span style={{fontSize:"9px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.ghost}}>Belum Dibuka</span>
            </div>
          ))}
        </div>
        <p style={{fontSize:"11px",color:T.muted,marginTop:"20px",fontStyle:"italic"}}>{isCoord?"Menu akan dibuka oleh koordinator masing-masing.":"Koordinator akan membuka pre-order sebelum keberangkatan."}</p>
      </div>
    </div>
  );
});

// ─── PATCH 3: DISABLED ITEM RENDERING in RestaurantView ──────────────────────
const RestaurantView = memo(({resto,user,isCoord,onBack}) => {
  const [tab,setTab] = useState("order");
  const [cat,setCat] = useState(resto.categories[0].id);
  const [cart,setCart] = useState({});
  const [submitted,setSubmitted] = useState(false);
  const [locked,setLocked] = useState(false);
  const [allOrders,setAllOrders] = useState({});
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [notes,setNotes] = useState({});
  const [lastSync,setLastSync] = useState(null);
  const [syncError,setSyncError] = useState(null);

  const refresh = useCallback(async () => {
    setSyncError(null);
    try {
      const lockVal = await sGet(`lock.${resto.id}`);
      setLocked(lockVal==="true");
      const keys = await sList(`order.${resto.id}.`);
      const grouped = {};
      for(const k of keys){
        const v = await sGet(k);
        if(v){ const name=k.replace(`order.${resto.id}.`,"").replace(/_/g," "); grouped[name]=JSON.parse(v); }
      }
      setAllOrders(grouped);
      setLastSync(new Date());
    } catch { setSyncError("Gagal memuat data. Cek koneksi."); }
  }, [resto.id]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const lockVal = await sGet(`lock.${resto.id}`);
        setLocked(lockVal==="true");
        const keys = await sList(`order.${resto.id}.`);
        const grouped = {};
        for(const k of keys){
          const v = await sGet(k);
          if(v){ const name=k.replace(`order.${resto.id}.`,"").replace(/_/g," "); grouped[name]=JSON.parse(v); }
        }
        setAllOrders(grouped);
        setLastSync(new Date());
        if (grouped[user]) {
          const myItems = {};
          (grouped[user].items||[]).forEach(it=>{ myItems[it.name]={name:it.name,qty:it.qty,notes:it.notes||""}; });
          const cartById = {};
          resto.categories.forEach(c=>c.items.forEach(item=>{ if(myItems[item.name]) cartById[item.id]=myItems[item.name]; }));
          setCart(cartById);
          setSubmitted(true);
          setTab("recap");
        }
      } catch { setSyncError("Gagal memuat data."); }
      setLoading(false);
    })();
  }, [resto.id, user]);

  useEffect(()=>{ const id=setInterval(refresh,30000); return ()=>clearInterval(id); },[refresh]);

  const add = item => { if(item.disabled) return; setCart(p=>({...p,[item.id]:{name:item.name,qty:(p[item.id]?.qty||0)+1,notes:p[item.id]?.notes||"",price:item.price||null}})); };
  const rem = id  => setCart(p=>{ const n={...p}; if(n[id]?.qty>1) n[id]={...n[id],qty:n[id].qty-1}; else delete n[id]; return n; });
  const setNote = (id,v) => setCart(p=>p[id]?{...p,[id]:{...p[id],notes:v}}:p);
  const cartCount = Object.values(cart).reduce((s,i)=>s+i.qty,0);

  const submit = useCallback(async () => {
    if(!cartCount||saving) return;
    setSaving(true); setSyncError(null);
    try {
      const items = Object.values(cart).map(i=>({name:i.name,qty:i.qty,notes:i.notes||"",price:i.price||0}));
      const nettIDR  = items.reduce((s,i)=>s+(i.price||0)*i.qty,0);
      const totalIDR = resto.taxRate ? Math.round(nettIDR*(1+resto.taxRate)) : nettIDR;
      const key = `order.${resto.id}.${user.replace(/\s+/g,"_")}`;
      const ok = await sSet(key, JSON.stringify({peserta:user,hh:ALL_PAX.find(p=>p.name===user)?.hh||"",items,totalIDR,submittedAt:new Date().toISOString()}));
      if(ok){ setSubmitted(true); await refresh(); setTab("recap"); }
      else setSyncError("Gagal menyimpan order. Coba lagi.");
    } catch { setSyncError("Gagal menyimpan order. Coba lagi."); }
    setSaving(false);
  },[cart,cartCount,resto.id,user,refresh,saving]);

  const toggleLock = async () => { const nl=!locked; await sSet(`lock.${resto.id}`,String(nl)); setLocked(nl); };

  const exportCSV = () => {
    const rows=[["Peserta","HH","Menu","Jumlah","Catatan"]];
    Object.values(allOrders).forEach(o=>(o.items||[]).forEach(item=>rows.push([o.peserta||"",o.hh||"",item.name,item.qty,item.notes||""])));
    const csv=rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download=`PreOrder_${resto.name.replace(/\s+/g,"_")}.csv`;
    a.click();
  };

  const ordered=Object.keys(allOrders).length;
  const total=resto.participants.length;
  const showRecap=isCoord||(submitted&&tab==="recap");

  if(loading) return (
    <div style={{textAlign:"center",padding:"80px 0",color:T.muted}}>
      <p style={{fontSize:"12px",letterSpacing:"2px",textTransform:"uppercase"}}>Memuat data dari Firebase…</p>
    </div>
  );

  return (
    <div className="fade-up">
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,padding:"0 0 32px",display:"flex",alignItems:"center",gap:"8px"}}>← Kembali</button>

      <div style={{marginBottom:"48px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"16px",marginBottom:"8px"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"6px"}}>
              <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"32px",fontWeight:400,color:T.ink}}>{resto.name}</h2>
              <span style={{fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",padding:"3px 8px",border:`1px solid ${locked?"#c88":T.settled}`,color:locked?T.danger:T.settled}}>{locked?"Ditutup":"Terbuka"}</span>
            </div>
            <p style={{fontSize:"11px",color:T.muted}}>{resto.subtitle} · {resto.note}</p>
            {resto.deadline&&<p style={{fontSize:"10px",color:T.warn,marginTop:"4px",letterSpacing:"0.5px"}}>Deadline pre-order: {resto.deadline}</p>}
            {resto.taxRate&&<p style={{fontSize:"10px",color:T.muted,marginTop:"4px"}}>Harga nett · +11% pajak pemerintah & +10% service charge ditambahkan saat checkout</p>}
            {lastSync&&<p style={{fontSize:"10px",color:T.ghost,marginTop:"4px"}}>Tersimpan: {lastSync.toLocaleTimeString("id-ID")} · Auto-refresh 30 dtk</p>}
          </div>
          <div style={{display:"flex",gap:"12px",alignItems:"center",flexWrap:"wrap"}}>
            {isCoord&&<button onClick={toggleLock} style={{background:"none",border:`1px solid ${T.lineD}`,padding:"8px 18px",cursor:"pointer",fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:locked?T.settled:T.danger}}>{locked?"Buka Order":"Kunci Order"}</button>}
            {isCoord&&<button onClick={exportCSV} style={{background:T.forest,border:"none",padding:"8px 18px",cursor:"pointer",fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:"white"}}>Export CSV</button>}
            <button onClick={refresh} style={{background:"none",border:`1px solid ${T.line}`,padding:"8px 18px",cursor:"pointer",fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted}}>↻ Refresh</button>
          </div>
        </div>
        {syncError&&<div style={{background:T.dangerBg,border:"1px solid #e8b4a8",padding:"10px 16px",marginTop:"8px"}}><p style={{fontSize:"11px",color:T.danger}}>{syncError}</p></div>}
      </div>

      <div style={{display:"flex",borderBottom:`1px solid ${T.line}`,marginBottom:"40px"}}>
        {[{id:"order",label:"Order Saya"},{id:"recap",label:`Rekap Semua — ${ordered}/${total}`}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",padding:"0 32px 16px 0",cursor:"pointer",fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",fontWeight:tab===t.id?500:300,color:tab===t.id?T.forest:T.muted,borderBottom:tab===t.id?`2px solid ${T.forest}`:"2px solid transparent",marginBottom:"-1px",transition:"all 0.2s"}}>{t.label}</button>
        ))}
      </div>

      {tab==="order"&&<div>
        {locked&&!isCoord&&<div style={{background:T.dangerBg,border:"1px solid #e8b4a8",padding:"16px 20px",marginBottom:"24px"}}><p style={{fontSize:"11px",color:T.danger}}>Pre-order telah ditutup. Hubungi koordinator untuk perubahan.</p></div>}
        {submitted&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:T.settledBg,padding:"14px 20px",marginBottom:"24px"}}>
          <p style={{fontSize:"11px",color:T.settled}}>✓ Order Anda sudah terkirim ke Firebase.</p>
          {!locked&&<button onClick={()=>{setSubmitted(false);setTab("order");}} style={{background:"none",border:`1px solid ${T.settled}`,padding:"5px 14px",cursor:"pointer",fontSize:"10px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.settled}}>Edit</button>}
        </div>}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"28px",paddingBottom:"16px",borderBottom:`1px solid ${T.line}`}}>
          <p style={{fontSize:"11px",color:T.muted}}>Pemesanan sebagai <span style={{color:T.ink,fontWeight:500}}>{user}</span></p>
          {cartCount>0&&<span style={{fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:T.forest,fontWeight:500}}>{cartCount} item dipilih</span>}
        </div>

        <div style={{display:"flex",flexWrap:"wrap",borderBottom:`1px solid ${T.line}`,marginBottom:"32px"}}>
          {resto.categories.map(c=>(
            <button key={c.id} onClick={()=>setCat(c.id)} style={{background:"none",border:"none",padding:"10px 20px 10px 0",cursor:"pointer",fontSize:"10px",letterSpacing:"2px",textTransform:"uppercase",color:cat===c.id?T.ink:T.muted,fontWeight:cat===c.id?500:300,borderBottom:cat===c.id?`2px solid ${T.ink}`:"2px solid transparent",marginBottom:"-1px",transition:"all 0.2s"}}>{c.name}</button>
          ))}
        </div>

        {resto.categories.filter(c=>c.id===cat).map(c=>(
          <div key={c.id} style={{borderTop:`1px solid ${T.line}`}}>
            {c.items.map(item=>{
              const inCart=cart[item.id];
              const isDisabled = item.disabled === true;
              const hasPrice = item.price != null && !isDisabled;
              return (
                <div key={item.id} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"24px",alignItems:"center",borderBottom:`1px solid ${T.line}`,padding:"20px",margin:"0 -20px",background:isDisabled?T.stone:inCart?T.cream:"transparent",opacity:isDisabled?0.45:1,transition:"background 0.2s"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"2px",flexWrap:"wrap"}}>
                      <p style={{fontSize:"14px",color:isDisabled?T.muted:T.ink,fontWeight:inCart?500:300,margin:0}}>{item.name}</p>
                      {hasPrice&&<span style={{fontSize:"10px",letterSpacing:"1px",color:T.gold,border:`1px solid ${T.goldL}`,padding:"1px 7px",fontWeight:500,whiteSpace:"nowrap"}}>IDR {item.price.toLocaleString("id-ID")}</span>}
                    </div>
                    {isDisabled&&<p style={{fontSize:"10px",color:T.ghost,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"2px"}}>{item.price&&item.price>=200?`Tidak tersedia — IDR ${(item.price/1000).toLocaleString("id-ID")}k melebihi batas IDR 200k`:"Harga pasar — hubungi koordinator"}</p>}
                    {item.desc&&<p style={{fontSize:"11px",color:isDisabled?T.ghost:T.muted,fontStyle:"italic"}}>{item.desc}</p>}
                    {inCart&&!isDisabled&&<input value={notes[item.id]||inCart.notes||""} onChange={e=>{setNotes(n=>({...n,[item.id]:e.target.value}));setNote(item.id,e.target.value);}}
                      placeholder="Catatan khusus (opsional)"
                      style={{marginTop:"10px",width:"100%",maxWidth:"360px",padding:"8px 0",border:"none",borderBottom:`1px solid ${T.lineD}`,background:"transparent",fontSize:"12px",color:T.mid,outline:"none"}}/>}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
                    {inCart&&!isDisabled&&<>
                      <button onClick={()=>rem(item.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"18px",color:T.muted,lineHeight:1,fontFamily:"serif",padding:"4px 8px"}}>−</button>
                      <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"18px",color:T.ink,minWidth:"24px",textAlign:"center"}}>{inCart.qty}</span>
                    </>}
                    {isDisabled
                      ? <span style={{fontSize:"11px",color:T.ghost,fontStyle:"italic",padding:"4px 10px",minWidth:"32px",textAlign:"center"}}>N/A</span>
                      : <button onClick={()=>add(item)} disabled={locked&&!isCoord} style={{background:"none",border:`1px solid ${locked&&!isCoord?T.ghost:T.ink}`,cursor:locked&&!isCoord?"not-allowed":"pointer",fontSize:"16px",color:locked&&!isCoord?T.ghost:T.ink,fontFamily:"serif",padding:"4px 10px",transition:"all 0.2s"}}>+</button>
                    }
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {cartCount>0&&<div style={{marginTop:"40px",padding:"32px",background:T.cream,borderTop:`2px solid ${T.forest}`}}>
          <p style={{fontSize:"9px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"20px"}}>Ringkasan Pesanan</p>
          {(()=>{
            const cartEntries = Object.entries(cart);
            const hasPrices = cartEntries.some(([,item])=>item.price!=null);
            const nettTotal = hasPrices ? cartEntries.reduce((s,[,item])=>s+(item.price||0)*item.qty,0) : 0;
            const taxAmt    = resto.taxRate ? Math.round(nettTotal * resto.taxRate) : 0;
            const grandTotal = nettTotal + taxAmt;
            return <>
              {cartEntries.map(([id,item])=>(
                <div key={id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.line}`,gap:"12px"}}>
                  <span style={{fontSize:"13px",color:T.ink,flex:1}}>{item.name}{item.notes&&<span style={{color:T.muted,fontStyle:"italic"}}> · {item.notes}</span>}</span>
                  <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"15px",color:T.ink,minWidth:"32px",textAlign:"right"}}>×{item.qty}</span>
                  {hasPrices&&item.price&&<span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"14px",color:T.settled,minWidth:"120px",textAlign:"right"}}>IDR {(item.price*item.qty).toLocaleString("id-ID")}</span>}
                </div>
              ))}
              {hasPrices&&nettTotal>0&&<>
                {resto.taxRate&&<>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 4px",borderTop:`1px solid ${T.line}`,marginTop:"8px"}}>
                    <span style={{fontSize:"11px",color:T.muted}}>Subtotal (nett)</span>
                    <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"14px",color:T.ink}}>IDR {nettTotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0 8px"}}>
                    <span style={{fontSize:"11px",color:T.muted}}>Pajak 11% + Service 10%</span>
                    <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"14px",color:T.muted}}>IDR {taxAmt.toLocaleString("id-ID")}</span>
                  </div>
                </>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0 0",borderTop:`2px solid ${T.lineD}`}}>
                  <span style={{fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted}}>Total Bayar</span>
                  <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"22px",color:T.forest,fontWeight:500}}>IDR {grandTotal.toLocaleString("id-ID")}</span>
                </div>
              </>}
            </>;
          })()}
          <button onClick={submit} disabled={saving||locked} style={{marginTop:"24px",width:"100%",padding:"14px",background:locked?T.muted:T.forest,color:"white",border:"none",cursor:locked?"not-allowed":"pointer",fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",fontWeight:500,transition:"background 0.2s"}}>
            {saving?"Menyimpan ke Firebase…":locked?"Pemesanan Ditutup":"Kirim Pre-Order"}
          </button>
        </div>}
      </div>}

      {tab==="recap"&&<div>
        {!showRecap&&<p style={{fontSize:"12px",color:T.muted,fontStyle:"italic",padding:"20px 0"}}>Submit order Anda terlebih dahulu untuk melihat rekap semua peserta.</p>}
        {showRecap&&<>
          <div style={{marginBottom:"48px"}}>
            <p style={{fontSize:"9px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"24px"}}>Rekap Per Menu</p>
            {(()=>{
              const grandAllTotal = Object.values(allOrders).reduce((s,o)=>s+Number(o.totalIDR||0),0);
              const totalBoxes = Object.values(allOrders).reduce((s,o)=>s+(o.items||[]).reduce((ss,i)=>ss+Number(i.qty),0),0);
              if(!grandAllTotal&&!totalBoxes) return null;
              return (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1px",background:T.line,marginBottom:"32px"}}>
                  <div style={{background:T.cream,padding:"20px 24px"}}>
                    <p style={{fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"8px"}}>Total Kotak</p>
                    <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"28px",color:T.ink}}>{totalBoxes} <span style={{fontSize:"13px",color:T.muted}}>kotak</span></p>
                  </div>
                  <div style={{background:T.cream,padding:"20px 24px"}}>
                    <p style={{fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"8px"}}>Total Tagihan Semua</p>
                    <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"20px",color:T.forest}}>IDR {grandAllTotal.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              );
            })()}
            {(()=>{
              const tally={};
              Object.values(allOrders).forEach(o=>(o.items||[]).forEach(i=>{tally[i.name]=(tally[i.name]||0)+Number(i.qty);}));
              const sorted=Object.entries(tally).sort((a,b)=>b[1]-a[1]);
              if(!sorted.length) return <p style={{fontSize:"12px",color:T.muted,fontStyle:"italic"}}>Belum ada pesanan.</p>;
              return <div style={{borderTop:`1px solid ${T.line}`}}>
                {sorted.map(([name,qty])=>(
                  <div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:`1px solid ${T.line}`}}>
                    <span style={{fontSize:"13px",color:T.ink}}>{name}</span>
                    <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"20px",color:T.forest}}>{qty}×</span>
                  </div>
                ))}
              </div>;
            })()}
          </div>
          <div>
            <p style={{fontSize:"9px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"24px"}}>Status Per Peserta — {ordered}/{total}</p>
            <div style={{borderTop:`1px solid ${T.line}`}}>
              {resto.participants.map(p=>{
                const o=allOrders[p.name];
                const isMe=p.name===user;
                return (
                  <div key={p.name} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"16px",alignItems:"start",borderBottom:`1px solid ${T.line}`,padding:"16px 0",background:isMe?T.cream:"transparent"}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px",flexWrap:"wrap"}}>
                        <span style={{fontSize:"13px",color:T.ink,fontWeight:o?500:300}}>{p.name}</span>
                        {isMe&&<span style={{fontSize:"9px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.gold}}>Anda</span>}
                        <span style={{fontSize:"10px",color:T.muted}}>({p.hh})</span>
                      </div>
                      {o&&<div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"4px"}}>
                          {(o.items||[]).map((it,i)=><span key={i} style={{fontSize:"10px",color:T.muted}}>• {it.name} ×{it.qty}{it.notes&&` (${it.notes})`}</span>)}
                        </div>
                        {o.totalIDR>0&&<p style={{fontSize:"12px",color:T.settled,fontFamily:"'Playfair Display',Georgia,serif",marginTop:"2px"}}>Total: IDR {Number(o.totalIDR).toLocaleString("id-ID")}</p>}
                      </div>}
                    </div>
                    <p style={{fontSize:"9px",letterSpacing:"1.5px",textTransform:"uppercase",color:o?T.settled:T.ghost,marginTop:"3px",whiteSpace:"nowrap"}}>{o?"✓ Terkirim":"Belum Order"}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>}
      </div>}
    </div>
  );
});

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{minHeight:"100vh",background:"#f3ede4",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px"}}>
          <div style={{maxWidth:"600px",width:"100%"}}>
            <p style={{fontSize:"10px",letterSpacing:"3px",textTransform:"uppercase",color:"#9c8e82",marginBottom:"16px"}}>Terjadi Kesalahan</p>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"24px",color:"#1a1512",marginBottom:"24px"}}>App crashed — detail untuk koordinator:</h2>
            <pre style={{background:"#fff",padding:"20px",fontSize:"11px",color:"#7a2e20",overflowX:"auto",border:"1px solid #e0d5c8",whiteSpace:"pre-wrap",wordBreak:"break-all"}}>
              {this.state.error.toString()}{"\n\n"}{this.state.error.stack}
            </pre>
            <button onClick={()=>window.location.reload()} style={{marginTop:"24px",background:"none",border:"1px solid #243d30",padding:"10px 24px",cursor:"pointer",fontSize:"11px",letterSpacing:"2px",textTransform:"uppercase",color:"#243d30"}}>Muat Ulang</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [screen,setScreen] = useState("password");
  const [user,setUser] = useState("");
  const [tab,setTab] = useState("budget");

  if(screen==="password") return <PasswordScreen onSuccess={()=>setScreen("name")}/>;
  if(screen==="name") return <NameScreen onSuccess={n=>{setUser(n);setScreen("main");}}/>;
  return (
    <ErrorBoundary>
      <Shell user={user} tab={tab} setTab={setTab}>
        {tab==="budget"    && <BudgetTab user={user}/>}
        {tab==="itinerary" && <ItineraryTab/>}
        {tab==="food"      && <FoodOrderTab user={user}/>}
      </Shell>
    </ErrorBoundary>
  );
}
