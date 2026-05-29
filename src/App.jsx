import { useState, useEffect, useCallback, useRef, memo, Component, Fragment } from "react";
import { sGet, sSet, sList, onValue, ref, db } from "./firebase";

const T = {
  stone:"#f3ede4",cream:"#faf7f2",white:"#ffffff",ink:"#1a1512",mid:"#5c5048",
  muted:"#9c8e82",ghost:"#c8bdb4",forest:"#243d30",forestL:"#3a5c49",
  gold:"#9a7a40",goldL:"#c4a870",settled:"#2c5038",settledBg:"#edf4ef",
  warn:"#6b4c1e",warnBg:"#f9f2e8",danger:"#7a2e20",dangerBg:"#f8efed",
  abs:"#3a4a6a",absBg:"#eef0f6",line:"#e0d5c8",lineD:"#ccc0b0",
};

const PASSWORD = "opsahat2026";
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
    {time:"17.30",act:"Transfer ke Hyatt Regency",loc:"5 × Toyota Innova · Tugu → Hyatt",type:"transport",note:"Tiba ±19.00. Nadia menyusul — penerbangan pagi dari Jakarta, 3 Juli (±06.00–10.00).",vehicles:[
      {mobil:"Mobil 1",pax:"Monang · Rohana · Agustinus · Linda · Adolf",bagasi:"Tanpa koper/tas"},
      {mobil:"Mobil 2",pax:"Ronald · Ferdiana · Ivana · Mariana · Olive",bagasi:"Tanpa koper/tas"},
      {mobil:"Mobil 3",pax:"Leandro · Rany · Nhaomy · Lusiana",bagasi:"Koper"},
      {mobil:"Mobil 4",pax:"Agustianto · Christine · Alexander · Intan",bagasi:"Koper"},
      {mobil:"Mobil 5",pax:"Gerard · Diana · Arlo · Alora",bagasi:"Koper"},
    ]},
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
        {id:"eb-ayam",name:"Express Bowl Ayam",desc:"Chicken",options:[{id:"saus",label:"Pilihan Saus",required:true,choices:["Mentega","Rica-rica","Asam Manis","Mayo","Teriyaki"]}]},
        {id:"eb-ikan",name:"Express Bowl Ikan",desc:"Fish",options:[{id:"saus",label:"Pilihan Saus",required:true,choices:["Mentega","Rica-rica","Asam Manis","Mayo","Teriyaki"]}]},
        {id:"eb-mix",name:"Express Bowl Mix",desc:"Udang, Ayam & Ikan",options:[{id:"saus",label:"Pilihan Saus",required:true,choices:["Mentega","Rica-rica","Asam Manis","Mayo","Teriyaki"]}]},
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
        {id:"dr-coke",name:"Soft Drink",desc:"Pilih",options:[{id:"jenis",label:"Pilihan",required:true,choices:["Coke","Fanta","Sprite"]}]},{id:"dr-teh-botol",name:"Teh Botol Sosro",desc:""},
        {id:"dr-air-mineral",name:"Air Mineral Botol",desc:""},{id:"dr-es-teh-manis",name:"Es Teh Manis",desc:""},
        {id:"dr-teh-manis-panas",name:"Teh Manis Panas",desc:""},{id:"dr-es-teh-tawar",name:"Es Teh Tawar",desc:""},
        {id:"dr-teh-panas",name:"Teh Panas",desc:""},{id:"dr-es-batu",name:"Es Batu",desc:""},
      ]},
    ]
  },
  {
    id:"ayom",name:"Ayom Jogja",subtitle:"D2 · Makan Malam · 3 Juli 2026, 17.00",
    note:"Restoran tepi sawah, Sukunan Banyuraden Gamping Sleman · 23 pax · Sponsor: HH3 Monang · Harga sudah termasuk pajak & service",
    deadline:"25 Juni 2026",
    participants: ALL_PAX,
    categories:[
      {id:"pembuka",name:"Pembuka",items:[
        {id:"ay-salmon-salad",name:"Salmon Salad",desc:"Salad salmon panggang, selada romain, tomat ceri, roti baguette",price:68000},
        {id:"ay-salad-udang",name:"Salad Udang Lotis",desc:"Udang rebus, buah-buahan, saus gula aren, cabai, ketumbar, kerupuk",price:47000},
        {id:"ay-caesar",name:"Classic Caesar Salad",desc:"Salad klasik · Tambahan Chicken +18K / Beef +20K",price:48000},
        {id:"ay-jagung",name:"Jagung Jemari Puteri",desc:"Jagung baby panggang dengan taburan keju",price:42000},
        {id:"ay-singkong",name:"Singkong Goreng Merekah",desc:"Singkong goreng, disajikan dengan topping abon kelapa",price:38000},
        {id:"ay-ubi-brulee",name:"Ubi Brulee",desc:"Ubi panggang dengan keju mozzarella",price:39000},
        {id:"ay-kroket",name:"Kroket Belanda",desc:"Kroket goreng renyah dengan saus",price:48000},
      ]},
      {id:"cemilan",name:"Cemilan",items:[
        {id:"ay-tahu-udang",name:"Tahu Isi Udang",desc:"",price:48000},
        {id:"ay-pisang-aroma",name:"Pisang Aroma",desc:"",price:49000},
        {id:"ay-chicken-wings",name:"Chicken Wings",desc:"",price:56000},
        {id:"ay-pisang-almond",name:"Pisang Goreng Almond",desc:"",price:42000},
        {id:"ay-fries",name:"French Fries",desc:"",price:38000},
        {id:"ay-gorengan",name:"Gorengan Ayom",desc:"",price:48000},
        {id:"ay-pisang-goreng",name:"Pisang Goreng Ayom",desc:"",price:39000},
        {id:"ay-tahu-cabe",name:"Tahu Cabe Kering",desc:"",price:38000},
      ]},
      {id:"khas",name:"Khas Ayom",items:[
        {id:"ay-nasi-campur",name:"Nasi Campur Sultan",desc:"Nasi basmati daun kemangi, bone marrow, ayam kampung goreng, sate sawah 1 tusuk, kering kentang, abon, urap, sambal matah",price:158000},
        {id:"ay-ayam-sambal-ijo",name:"Ayam Sambal Ijo Nasi Daun Jeruk",desc:"Ayam bumbu kemangi, nasi basmati daun jeruk, sambal ijo, tomat ceri, jeruk limau, dabu merah hijau",price:79000},
        {id:"ay-sate-sawah",name:"Sate Ayam Sawah",desc:"Sate ayam bumbu kemangi, nasi basmati mentega, kecap cabe, tomat ceri, jeruk limau, dabu merah hijau",price:85000},
        {id:"ay-ayam-goreng-kampung",name:"Ayam Goreng Kampung Nasi Daun Kemangi",desc:"Ayam kampung goreng 1/2 ekor, nasi daun kemangi, urap, sambal matah",price:78000},
        {id:"ay-ayam-kriuk",name:"Ayam Kriuk Kriuk",desc:"Ayam ruas paha atas bumbu tepung, nasi basmati mentega, dabu merah hijau",price:79000},
        {id:"ay-bebek-tengil",name:"Bebek Tengil Nasi Daun Kemangi",desc:"Bebek goreng 1/2 ekor, nasi basmati daun kemangi, urap, sambal matah",price:88000},
        {id:"ay-sop-iga",name:"Sop Iga Sukunan",desc:"Sop bumbu khas Ayom, daging iga, termasuk nasi dan emping",price:89000},
        {id:"ay-rawon-iga",name:"Rawon Iga Hitam Manis",desc:"Rawon iga, nasi putih, telur asin brebes, kerupuk udang, sambal terasi",price:95000},
        {id:"ay-iga-bakar",name:"Iga Bakar 500 Gr",desc:"Iga bakar barbeque 500gr, jagung bakar, coleslaw, french fries",price:158000},
        {id:"ay-sate-maranggi",name:"Sate Bahari Maranggi",desc:"Tenderloin bumbu tradisional, nasi basmati mentega",price:149000},
        {id:"ay-udang-maharaja",name:"Udang Maharaja",desc:"Udang ukuran besar, bumbu khas Ayom manis dan pedas, nasi basmati mentega",price:149000},
        {id:"ay-sop-tenggiri",name:"Sop Ikan Tenggiri",desc:"Sop ikan tenggiri bumbu kuning, tomat hijau, belimbing wuluh, nasi putih, sambal terasi",price:78000},
        {id:"ay-pecel-rames",name:"Pecel Rames Sukunan",desc:"Nasi pecel bumbu kacang, ayam goreng, sate paru, 1/2 telur asin brebes",price:85000},
        {id:"ay-ayam-kecombrang",name:"Ayam Panggang Bumbu Kecombrang",desc:"Nasi basmati mentega, sambal matah",price:85000},
        {id:"ay-ikan-nila-bakar",name:"Nila Bakar Bumbu Bali",desc:"Nasi basmati daun kemangi, dabu merah hijau, sambal kecap",price:76000},
      ]},
      {id:"seafood",name:"Seafood Khas Ayom",items:[
        {id:"ay-nasi-pedas-laut",name:"Nasi Pedas Lautan Rasa",desc:"Hidangan spesial memadukan kekayaan hasil laut, cita rasa pedas dan gurih",price:125000},
        {id:"ay-sate-tenggiri",name:"Sate Tenggiri Nusa Rasa",desc:"Sate tenggiri juicy, nasi kari",price:89000},
        {id:"ay-udang-sewindu",name:"Udang Sewindu",desc:"Grilled king tiger prawn, mixed tossed traditional blanched vegetables, plecing sambal, basmati butter rice",price:148000},
        {id:"ay-tilapia",name:"Tilapia Masak Dabu",desc:"Ikan tilapia bumbu kemangi, kentang tumbuk, tomat ceri, jeruk limau, dabu merah hijau",price:88000},
      ]},
      {id:"berbagi",name:"Hidangan Berbagi",items:[
        {id:"ay-sate-sawah-7",name:"Sate Sawah Tujuh Tusuk",desc:"Sate ayam bumbu kemangi 7 tusuk",price:118000},
        {id:"ay-udang-goreng-terasi",name:"Udang Goreng Sambal Terasi",desc:"Udang goreng, sajikan dengan sambal terasi",price:79000},
        {id:"ay-tenggiri-bakar",name:"Tenggiri Bakar Nusantara",desc:"Sate ikan tenggiri 5 tusuk, cita rasa laut khas, kreasi premium",price:119000},
      ]},
      {id:"nasgor",name:"Nasi Goreng",items:[
        {id:"ay-ng-rendang",name:"Nasi Goreng Rendang",desc:"Nasi goreng Sumatera bumbu rendang, kerupuk emping, daging sapi, telur goreng, sambal",price:89000},
        {id:"ay-ng-kambing",name:"Nasi Goreng Kambing",desc:"",price:84000},
      ]},
      {id:"steak",name:"Steak Reguler",items:[
        {id:"ay-tenderloin",name:"Tenderloin",desc:"Grilled Tenderloin, mashed potato, mixed salad, blackpepper sauce",price:158000},
        {id:"ay-tenderloin-angus",name:"Tenderloin Angus",desc:"Grilled Tenderloin Angus, mashed potato, mixed salad, mushroom sauce",price:299000},
        {id:"ay-prime-angus",name:"Prime Angus Striploin",desc:"Grilled aussie premium angus striploin, mixed salad, chimichurri mushroom sauce",price:239000},
        {id:"ay-us-blade-150",name:"US Meat Steak 150gr",desc:"Grilled US Top Blade, french fries, mixed salad, mushroom sauce",price:173000},
        {id:"ay-us-blade-300",name:"US Meat Steak 300gr",desc:"Grilled US Top Blade, french fries, mixed salad, mushroom sauce",price:297000},
        {id:"ay-us-blade-500",name:"US Meat Steak 500gr",desc:"Grilled US Top Blade, french fries, mixed salad, mushroom sauce",price:459000},
        {id:"ay-ribeye",name:"Rib Eye",desc:"Grilled Rib Eye, choice potato, choice sauce",price:335000},
      ]},
      {id:"steak-live",name:"Steak Live Cooking",items:[
        {id:"ay-lc-blade",name:"US Top Blade / 100gr",desc:"Grilled US Top Blade, french fries, mixed salad, mushroom sauce · Min order 500gr",price:93000},
        {id:"ay-lc-prime",name:"Prime Angus Striploin / 100gr",desc:"Grilled Striploin, french fries, mixed salad, mushroom sauce · Min order 500gr",price:118000},
        {id:"ay-lc-tenderloin-aussie",name:"Tenderloin Aussie / 100gr",desc:"Grilled Tenderloin, french fries, mixed salad, mushroom sauce · Min order 500gr",price:85000},
        {id:"ay-lc-tenderloin-angus",name:"Tenderloin Angus / 100gr",desc:"Grilled US Hanging Tender, french fries, mixed salad, mushroom sauce · Min order 500gr",price:130000},
      ]},
      {id:"western",name:"Western",items:[
        {id:"ay-salmon",name:"Norwegian Salmon",desc:"Ikan salmon, mashed potato, mixed salad",price:165000},
        {id:"ay-philly",name:"Philly Cheese Steak",desc:"Roti phily, isian daging cincang, french fries",price:68000},
        {id:"ay-burger",name:"American Burger",desc:"Burger isian daging paty, french fries",price:76000},
      ]},
      {id:"pasta",name:"Pasta",items:[
        {id:"ay-aglio",name:"Aglio E Olio Prawn Butter",desc:"Pasta dengan udang khas Ayom, olahan rempah, roti baguette",price:86000},
        {id:"ay-carbonara",name:"Carbonara Smoked Beef",desc:"Pasta saus keju, smoked beef, roti baguette",price:69000},
        {id:"ay-bolognese",name:"Ayom Bolognese",desc:"Pasta saus tomat, daging cincang, roti baguette",price:69000},
      ]},
      {id:"kreasi-nasi",name:"Kreasi Nasi",items:[
        {id:"ay-nasi-daun-jeruk",name:"Nasi Daun Jeruk Personal / Porsi",desc:"",price:30000},
        {id:"ay-nasi-basmati",name:"Nasi Basmati Mentega Personal / Porsi",desc:"",price:30000},
        {id:"ay-nasi-putih",name:"Nasi Putih",desc:"",price:8500},
      ]},
      {id:"dessert",name:"Penutup",items:[
        {id:"ay-french-toast",name:"French Toast Ice Cream Vanila",desc:"",price:49000},
        {id:"ay-tiramisu",name:"Tiramisu",desc:"",price:47000},
        {id:"ay-panna-cotta",name:"Strawberry Panna Cotta",desc:"",price:39000},
        {id:"ay-creme-brulee",name:"Creme Brulee",desc:"",price:39000},
        {id:"ay-gelato-s",name:"Gelato Small",desc:"2 flavor · 2 scoop · Pilihan: Salted Caramel / Chocolate / Chocolate Mint / Oreo / Vanilla Bourbon / Big Ball Bubble Gum / Mandarino / Strawberry",price:46000},
        {id:"ay-gelato-m",name:"Gelato Medium",desc:"2 flavor · 3 scoop",price:55000},
      ]},
      {id:"kopi",name:"Kopi & Khas",items:[
        {id:"ay-espresso",name:"Espresso",desc:"Single shot / Doppio / Lungo",price:23000},
        {id:"ay-americano",name:"Americano",desc:"",price:31000},
        {id:"ay-cappuccino",name:"Cappuccino",desc:"",price:35000},
        {id:"ay-latte",name:"Caffe Latte",desc:"",price:34000},
        {id:"ay-mochacino",name:"Mochacino",desc:"",price:37000},
        {id:"ay-kopi-susu-ayom",name:"Kopi Susu Ayom",desc:"Kopi dengan susu adonan ayom, rasa kelapa yang manis",price:37000},
        {id:"ay-kopi-susu-sanjana",name:"Kopi Susu Sanjana",desc:"Kopi dengan susu adonan ayom, gula palem",price:36000},
        {id:"ay-tirtagangga",name:"Tirtagangga",desc:"Olahan kopi khas Ayom · Aroma bunga tropis, rasa bubblegum manis berpadu rasa kopi",price:41000},
        {id:"ay-mandalawangi",name:"Mandalawangi",desc:"Olahan kopi khas Ayom · Rasa kopi tipis dengan kombucha, sensasi buah tropis",price:41000},
        {id:"ay-meranti",name:"Meranti",desc:"Olahan kopi khas Ayom · Perpaduan kopi dan susu segar, rasa coklat kacang manis tiramisu",price:42000},
      ]},
      {id:"non-kopi",name:"Non Kopi",items:[
        {id:"ay-niskala",name:"Niskala",desc:"Rasa susu · Coklat dengan susu adonan ayom",price:39000},
        {id:"ay-nawasena",name:"Nawasena",desc:"Rasa susu · Red velvet dengan susu adonan ayom",price:39000},
        {id:"ay-temaram",name:"Temaram",desc:"Khas Ayom · Olahan sirup rempah, campuran kombucha dan tamarind",price:41000},
        {id:"ay-nandikara",name:"Nandikara",desc:"Khas Ayom · Manis susu ungu dicampurkan dengan susu gandung dan pisang",price:45000},
        {id:"ay-demak-ijo",name:"Demak Ijo",desc:"Khas Ayom · Minuman kesehatan sayuran hijau dicampur air kelapa",price:48000},
        {id:"ay-naloni",name:"Naloni",desc:"Khas Ayom · Minuman segar rasa rujak",price:46000},
        {id:"ay-nirmala",name:"Soda Nirmala",desc:"Soda segar · Rasa permen karet",price:33000},
        {id:"ay-lembayung",name:"Soda Lembayung",desc:"Soda segar · Rasa bunga lavender, madu murni dan soda",price:32000},
        {id:"ay-infuse-water",name:"Infuse Water",desc:"Menu Berbagi · Minuman berbagi potongan buah-buahan tropis · untuk 4 orang (5x refill)",price:75000},
        {id:"ay-timun-serut",name:"Timun Serut",desc:"Menu Berbagi · Minuman segar timun, mentimun, irisan tipis, nata de coco · untuk 4 orang (5x refill)",price:75000},
      ]},
      {id:"teh-tradisional",name:"Teh & Tradisional",items:[
        {id:"ay-teh-sultan",name:"Teh Sultan Rempah Ayom",desc:"Teh khas Ayom dengan berbagai macam rempah wangi · untuk 2 porsi",price:49000},
        {id:"ay-teh-krampoel",name:"Teh Krampoel",desc:"Teh khas yang memiliki aroma jeruk jawak",price:32000},
        {id:"ay-teh-jahe",name:"Teh Jahe",desc:"",price:28000},
        {id:"ay-lychee-tea",name:"Lychee Tea",desc:"",price:36000},
        {id:"ay-wedang-uwuh",name:"Wedang Uwuh",desc:"Minuman dari bahan rempah-rempah merah, memiliki rasa pedas manis, disajikan panas",price:39000},
        {id:"ay-es-kelapa-ayom",name:"Es Kelapa Ayom",desc:"Minuman dari air dan daging kelapa, menawarkan rasa manis dan menyegarkan",price:35000},
        {id:"ay-jamu-kunir",name:"Jamu Kunir Asem",desc:"Jamu kunir asam murni, disajikan tanpa es",price:32000},
        {id:"ay-jamu-beras-kencur",name:"Jamu Beras Kencur",desc:"Jamu beras kencur murni, disajikan tanpa es",price:32000},
        {id:"ay-bir-pletok",name:"Bir Pletok",desc:"Minuman rempah Betawi tanpa alkohol · Rasa hangat, manis, pedas dan menenangkan",price:35000},
      ]},
      {id:"jus",name:"Jus & Segar",items:[
        {id:"ay-fresh-orange",name:"Fresh Squeeze Orange",desc:"Perasan murni jeruk manis tanpa gula",price:42000},
        {id:"ay-jus-semangka",name:"Semangka",desc:"",price:37000},
        {id:"ay-jus-mangga",name:"Mangga",desc:"",price:38000},
        {id:"ay-jus-alpukat",name:"Alpukat",desc:"",price:37000},
        {id:"ay-jus-sirsak",name:"Sirsak",desc:"",price:37000},
        {id:"ay-jus-strawberry",name:"Strawberry",desc:"",price:38000},
        {id:"ay-sirsak-leci",name:"Sirsak Leci",desc:"Menu Berbagi · Perpaduan buah sirsak dan leci · untuk 2 orang",price:62000},
        {id:"ay-nanas-rempah",name:"Nanas Rempah",desc:"Menu Berbagi · Infuse pineapple + rempah diperkuat air kelapa segar · untuk 2 orang",price:62000},
      ]},
      {id:"anak",name:"Anak-Anak",items:[
        {id:"ay-aruna",name:"Aruna",desc:"Susu segar dan ice cream blend merah, rasa pisang, topping coklat stik",price:43000},
        {id:"ay-dahayu",name:"Dahayu",desc:"Ice cream dan mixberry, topping strawberry, almond dan sereal",price:45000},
        {id:"ay-gayatri",name:"Gayatri",desc:"Susu hangat rasa coklat karamel, topping coklat stik dan marshmallow",price:45000},
        {id:"ay-arnawama",name:"Arnawama",desc:"Susu segar dan ice cream blend biru, rasa permen, topping warna-warni",price:43000},
      ]},
      {id:"air-mineral",name:"Air Mineral",items:[
        {id:"ay-pristine",name:"Pristine Mineral",desc:"",price:18000},
        {id:"ay-equil-natural",name:"Equil Natural",desc:"",price:29000},
        {id:"ay-equil-sparkling",name:"Equil Sparkling",desc:"",price:29000},
      ]},
      {id:"additional",name:"Tambahan",items:[
        {id:"ay-extra-sambal",name:"Extra Sambal",desc:"Pilihan: Sambal Ijo / Sambal Merah / Sambal Matah / Sambal Terasi",price:10000},
        {id:"ay-extra-sauce",name:"Extra Sauce",desc:"Pilihan: Sauce Mushroom / Sauce BBQ / Sauce Blackpepper / Sauce Chimichurri",price:10000},
      ]},
    ]
  },
  // ─── PATCH 2: SUMMER PALACE ─────────────────────────────────────────────────
  {
    id:"summer-palace",name:"Summer Palace",subtitle:"D4 · Makan Siang · 5 Juli 2026, 12.00",
    note:"Hotel Tentrem, Jl. A.M. Sangaji No.72A, Yogyakarta · 23 pax · Sponsor: HH1 Agustianto",
    taxRate:0.21,
    deadline:"25 Juni 2026",
    participants: ALL_PAX,
    categories:[
      {id:"sp-appetizer",name:"Appetizer",items:[
        {id:"sp-app-01",name:"Cumi Goreng Madu Wijen Cabai",desc:"Deep fried baby squid, honey sesame chili sauce",price:68000,disabled:false},
        {id:"sp-app-02",name:"Kulit Ikan Jagung Manis Telur Asin",desc:"Deep fried fish skin & sweet corn in salted egg",price:58000,disabled:false},
        {id:"sp-app-03",name:"Ikan Teri Jepang Goreng Kemangi",desc:"Deep fried white bait fish, chili salt pepper, local basil",price:68000,disabled:false},
        {id:"sp-app-04",name:"Kepiting Gembos Goreng Telur Asin",desc:"Deep fried soft shell crab with chili salted egg yolk",price:108000,disabled:false},
        {id:"sp-app-05",name:"Terong Goreng Telur Asin Pedas",desc:"Deep fried egg plant with spicy salted egg",price:48000,disabled:false},
        {id:"sp-app-06",name:"Salad Ubur-ubur Chinese Style",desc:"Jelly fish salad Chinese style",price:58000,disabled:false},
      ]},
      {id:"sp-barbeque",name:"Barbeque",items:[
        {id:"sp-bbq-01",name:"Aneka Panggangan Kanton ★",desc:"Cantonese assorted barbeque meat combination",price:388000,disabled:true},
        {id:"sp-bbq-02a",name:"Peking Duck ½ Ekor ★",desc:"Peking duck with lettuce, half bird",price:188000,disabled:true},
        {id:"sp-bbq-03",name:"Casio Ayam Madu (Chicken Leg)",desc:"BBQ honey roasted chicken leg",price:78000,disabled:false},
        {id:"sp-bbq-04c",name:"Bebek Panggang Hoisin (¼ Ekor)",desc:"Roasted duck with hoisin sauce, quarter bird",price:98000,disabled:false},
        {id:"sp-bbq-05a",name:"Ayam Hainan Saus Jahe (1 Ekor)",desc:"Poached Hainan chicken with ginger sauce, whole",price:198000,disabled:false},
        {id:"sp-bbq-05b",name:"Ayam Hainan Saus Jahe (½ Ekor)",desc:"Poached Hainan chicken with ginger sauce, half",price:108000,disabled:false},
      ]},
      {id:"sp-bird-nest",name:"Sarang Burung & Sari Laut Kering",items:[
        {id:"sp-bn-01",name:"Angsio Sarang Burung Superior ★",desc:"Braised superior bird nest",price:398000,disabled:true},
        {id:"sp-bn-02",name:"Sarang Burung Kepiting & Telur Kepiting ★",desc:"Braised bird nest with fresh crab meat, crab roe and coriander leaf",price:258000,disabled:true},
        {id:"sp-bn-03",name:"Sarang Burung Kuah Beijing Ging Tong ★",desc:"Braised bird nest soup with dried seafood in Beijing Ging Tong",price:268000,disabled:true},
        {id:"sp-bn-04",name:"Kerang Abalone F3, Hoisam & Brokoli ★",desc:"Braised whole abalone (F3) with sea cucumber and broccoli in oyster sauce",price:448000,disabled:true},
      ]},
      {id:"sp-soup",name:"Sup",items:[
        {id:"sp-soup-01",name:"Sup Maca, Kerang & Ayam (Double Boil)",desc:"Double boiled Peru maca root with sea conch and chicken",price:68000,disabled:false},
        {id:"sp-soup-02",name:"Sup Bunga Cordyceps & Ayam (Double Boil)",desc:"Double boiled cordyceps flower with chicken soup",price:118000,disabled:false},
        {id:"sp-soup-03",name:"Sup Kerang Abalone F10, Perut Ikan & Ginseng",desc:"Double boiled abalone (F10) with fish maw and ginseng root",price:148000,disabled:false},
        {id:"sp-soup-04",name:"Sup Bibir Ikan & Jamur",desc:"Fish lip soup combination with mushroom",price:48000,disabled:false},
        {id:"sp-soup-05",name:"Sup Asparagus Kepiting Segar",desc:"Asparagus soup with fresh crab meat",price:48000,disabled:false},
        {id:"sp-soup-06",name:"Sup Hisit Summer Palace ★",desc:"Summer Palace shark's fin soup",price:338000,disabled:true},
        {id:"sp-soup-07",name:"Sup Ayam Rempah China (Double Boil)",desc:"Double boiled chicken village with Chinese herb",price:98000,disabled:false},
        {id:"sp-soup-08",name:"Sup Shanghai",desc:"Soup Shanghai",price:48000,disabled:false},
      ]},
      {id:"sp-live-seafood",name:"Sari Laut Hidup ⚠️",items:[
        {id:"sp-ls-01",name:"Lobster (per 100g) ★",desc:"Cold salad / steam garlic / baked cheese / superior stock / ginger onion / salted egg — harga pasar",price:158000,disabled:true},
        {id:"sp-ls-02",name:"Ikan Kerapu Macan (per 100g) ★",desc:"Steam garlic / Hong Kong / lotus leaf chicken / Teo Chiew / deep fried / claypot — harga pasar",price:78000,disabled:true},
        {id:"sp-ls-03",name:"Ikan Malas / Pelangi (per 100g) ★",desc:"Steam garlic / Hong Kong / lotus leaf chicken / Teo Chiew / deep fried / claypot — harga pasar",price:88000,disabled:true},
        {id:"sp-ls-04",name:"Ikan Gurame (per 100g) ★",desc:"Steam garlic / Hong Kong / Thailand style / deep fried / Thai chili — harga pasar",price:28000,disabled:true},
      ]},
      {id:"sp-fresh-seafood",name:"Sari Laut Segar",items:[
        {id:"sp-fs-01",name:"Ikan Halibut Panggang Putih Telur & Telur Asin",desc:"Oven baked halibut fillet topped with egg white, served with salted egg fish skin",price:78000,disabled:false},
        {id:"sp-fs-02",name:"Kepiting Soka Goreng Thai",desc:"Deep fried soft shell crab with Thai chili sauce topped with garnish",price:118000,disabled:false},
        {id:"sp-fs-03",name:"Udang Goreng Wasabi Mayo & Salsa Mangga",desc:"Crispy prawn with wasabi mayonnaise and mango salsa, served in a basket",price:118000,disabled:false},
        {id:"sp-fs-04",name:"Udang Windu Goreng Oatmeal & Daun Kari",desc:"Deep fried king prawn with oatmeal & curry leaf",price:138000,disabled:false},
        {id:"sp-fs-05",name:"Udang Goreng Telur Emas",desc:"Deep fried butter prawn with a golden egg",price:138000,disabled:false},
        {id:"sp-fs-06",name:"Udang Goreng Mayo & Kerupuk Jagung",desc:"Deep fried prawn meat with sweet mayonnaise topped with corn flakes",price:118000,disabled:false},
        {id:"sp-fs-07",name:"Bistik Skalop Isi Udang & Ayam Saus Singapore",desc:"Pan fried scallop stuffed with prawn chicken meat with Singapore chili sauce",price:198000,disabled:false},
        {id:"sp-fs-08",name:"Tumis Skalop Brokoli Saus XO ★",desc:"Sauteed scallop with broccoli and XO sauce",price:228000,disabled:true},
      ]},
      {id:"sp-claypot",name:"Claypot / Hot Plate / Hot Stone",items:[
        {id:"sp-cp-01",name:"Sapo Kari Udang & Mantau Goreng",desc:"Claypot curry prawn with Chinese fried bun",price:138000,disabled:false},
        {id:"sp-cp-02",name:"Sapo Terong, Tofu & Ayam Cincang Cabai",desc:"Stewed eggplant and Japanese beancurd with minced chicken in spicy chili sauce, claypot",price:88000,disabled:false},
        {id:"sp-cp-03",name:"Sapo Ikan Halibut Bawang Bombay Teriyaki",desc:"Pan fried halibut fillet with white onion in teriyaki sauce, served in claypot",price:118000,disabled:false},
        {id:"sp-cp-04",name:"Hot Plate Pocay Tofu Siram Udang Cincang",desc:"Hot plate/hot stone Horenso beancurd braised with minced prawn",price:98000,disabled:false},
        {id:"sp-cp-05",name:"Sapo Angsio Hoisom, Hipio & Jamur Hitam",desc:"Braised sea cucumber Hipio, black mushroom & seasonal vegetables, claypot",price:108000,disabled:false},
        {id:"sp-cp-06",name:"Sapo Tahu Sari Laut Saus XO",desc:"Stewed beancurd with seafood and XO sauce in claypot",price:108000,disabled:false},
      ]},
      {id:"sp-meat",name:"Sapi / Ayam / Bebek / Kambing",items:[
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
      {id:"sp-vegetables",name:"Sayuran",items:[
        {id:"sp-veg-01",name:"Tumis Buncis Sapi Cincang & Ebi",desc:"Sauteed baby French bean with dry shrimp and minced beef",price:68000,disabled:false},
        {id:"sp-veg-02",name:"Kailan Hong Kong Dua Rasa",desc:"Hong Kong Kailan 2 flavors (garlic / salt & pepper)",price:68000,disabled:false},
        {id:"sp-veg-03",name:"Pocay Tiga Macam Telur, Ikan Teri Perak & Skalop Kering",desc:"Boiled Horenso with three kinds egg, fried silverfish Perak and dry scallop",price:78000,disabled:false},
        {id:"sp-veg-04",name:"Brokoli / Bayam Jepang / Sawi Tumis Bawang Putih",desc:"Sauteed broccoli/horenso/pok choy with golden garlic",price:58000,disabled:false},
        {id:"sp-veg-05",name:"Asparagus Tumis Saus XO & Jamur Shimeji",desc:"Sauteed asparagus with XO sauce and Shimeji mushroom",price:78000,disabled:false},
        {id:"sp-veg-06",name:"Baby Kailan Tumis Ebi & Sambal Belacan",desc:"Sauteed balachan with dry shrimp and baby kailan",price:58000,disabled:false},
        {id:"sp-veg-07",name:"Tumis Bayam Jepang (Horenso) Bawang Putih",desc:"Stir fry Horenso with minced garlic",price:58000,disabled:false},
        {id:"sp-veg-08",name:"Tumis Brokoli Bawang Putih",desc:"Stir fry broccoli with minced garlic",price:58000,disabled:false},
      ]},
      {id:"sp-tofu",name:"Tahu / Bean Curd",items:[
        {id:"sp-tf-01",name:"Tahu Isi Udang Saus Tiram",desc:"Tofu filled with shrimp served with oyster sauce",price:78000,disabled:false},
        {id:"sp-tf-02",name:"Kepiting & Jamur Shimeji Siram Tahu Bayam Jepang",desc:"Braised homemade beancurd Horenso with crab meat & Shimeji mushroom",price:78000,disabled:false},
        {id:"sp-tf-03",name:"Mapo Tofu Sapi Cincang Sichuan",desc:"Braised Mapo beancurd with minced beef in Sichuan style",price:68000,disabled:false},
      ]},
      {id:"sp-noodle-rice",name:"Mie / Nasi",items:[
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
      {id:"sp-dessert",name:"Hidangan Penutup",items:[
        {id:"sp-des-01",name:"Krim Mangga Sago, Lidah Buaya & Es Puter Stroberi",desc:"Chilled mango sago cream with aloe vera strawberry sorbet",price:33800,disabled:false},
        {id:"sp-des-02",name:"Krim Kacang Almond & Ronde (Panas)",desc:"Hot almond cream with glutinous rice ball",price:33800,disabled:false},
        {id:"sp-des-03",name:"Gui Ling Gao dengan Madu",desc:"Chilled Gui Ling Gao with wild honey",price:33800,disabled:false},
        {id:"sp-des-04",name:"Puding Pepaya",desc:"Papaya pudding",price:33800,disabled:false},
        {id:"sp-des-05",name:"Puding Kelapa, Saus Vanila & Daun Mint",desc:"Chilled coconut pudding with vanilla ice cream topped with mint leaf",price:33800,disabled:false},
        {id:"sp-des-06",name:"Onde-onde Hitam (Goreng Wijen)",desc:"Deep fried glutinous rice ball with black sesame",price:35800,disabled:false},
      ]},
    ]
  },
  // ─── DJIWANA CAFE & EATERY ────────────────────────────────────────────────────
  {
    id:"djiwana",name:"Djiwana Cafe & Eatery",subtitle:"D3 · Makan Siang · 4 Juli 2026, 12.00",
    note:"Djiwana Cafe & Eatery · 23 pax · Sponsor: HH2 Agustinus · Harga sudah termasuk pajak & service",
    deadline:"25 Juni 2026",
    participants: ALL_PAX,
    categories:[
      {id:"dj-croissant",name:"Croissants",items:[
        {id:"dj-cr-plain",  name:"Plain Croissant",     desc:"",price:32000},
        {id:"dj-cr-cheese", name:"Cheese Croissant",    desc:"",price:35000},
        {id:"dj-cr-almond", name:"Almond Croissant",    desc:"",price:35000},
        {id:"dj-cr-kismis", name:"Kismis Roll",         desc:"",price:35000},
        {id:"dj-cr-pandan", name:"Pandan Ribbon",       desc:"",price:35000},
        {id:"dj-cr-choco",  name:"Chocolate Croissant", desc:"",price:35000},
      ]},
      {id:"dj-puff",name:"Puff Pastry",items:[
        {id:"dj-pf-curry",  name:"Curry Puff",      desc:"",price:38000},
        {id:"dj-pf-berry",  name:"Berry Puff",      desc:"",price:38000},
        {id:"dj-pf-beef",   name:"Beef Floss Puff", desc:"",price:38000},
        {id:"dj-pf-salmon", name:"Salmon Puff",     desc:"",price:42000},
      ]},
      {id:"dj-light",name:"Light Bites",items:[
        {id:"dj-lb-corn",    name:"Corn Fritter Balls", desc:"Crispy sweet corn balls, Asian spices, spring onions, special sambal", price:38000},
        {id:"dj-lb-spring",  name:"Kecombrang Bamboo Shoots Spring Roll", desc:"Minced bamboo shoots, chicken, vegetables, fresh kecombrang, Thai dip", price:38000},
        {id:"dj-lb-nachos",  name:"Breadfruit Nachos", desc:"Crispy breadfruit crackers, melted cheese, salsa, guacamole, chimichurri", variants:[{label:"Chicken",price:48000},{label:"Beef",price:58000}]},
        {id:"dj-lb-platter", name:"House Favorite Snack Platter", desc:"Selection of finest light bites, three homemade dipping sauces", price:98000},
      ]},
      {id:"dj-sides",name:"Sides",items:[
        {id:"dj-sd-cassava", name:"Cassava", desc:"Marinated homegrown cassava, fried garlic, sambal kecombrang", price:28000,
         options:[{id:"style",label:"Pilihan",required:true,choices:["Steamed","Fried"]}]},
        {id:"dj-sd-enoki",   name:"Crispy Enoki Truffle", desc:"Fried enoki Japanese tempura style, truffle oil, Thai dressing", price:32000},
        {id:"dj-sd-cajun",   name:"Cajun Potato Wedges",  desc:"Deep fried potato wedges, cajun, herbs, sun-dried parsley", price:32000},
        {id:"dj-sd-truffle", name:"Truffle Fries",        desc:"Shoestring fries, truffle oil, parmesan, sun-dried parsley", price:36000},
      ]},
      {id:"dj-salad",name:"Salads",items:[
        {id:"dj-sl-yogurt", name:"Yogurt Fruit Salad", desc:"Seasonal fruits, yogurt mint dressing & fruit punch", price:46000},
        {id:"dj-sl-chef",   name:"Chef Salad",         desc:"Lettuce, cherry tomatoes, cucumbers, poached egg, smoked salmon, cheese sticks", price:48000},
        {id:"dj-sl-wana",   name:"Wanasekar Salad (V)", desc:"Greens, cherry tomatoes, cucumber, carrots, apple, turi flowers, red onion, kecombrang dressing", price:48000},
        {id:"dj-sl-caesar", name:"Caesar Salad",       desc:"Romaine, cheese sticks, parmesan, grilled chicken, boiled egg, anchovy-lemon Caesar dressing",
         variants:[{label:"Plain",price:48000},{label:"+ Chicken",price:66000},{label:"+ Beef",price:68000}]},
      ]},
      {id:"dj-soup",name:"Soups",items:[
        {id:"dj-sp-soto",   name:"Beef Ribs Soto Tangkar Kecombrang", desc:"Beef ribs in spiced coconut milk broth, vegetables, fresh kecombrang", price:110000},
        {id:"dj-sp-buntut", name:"Sop Buntut Wanasekar", desc:"Oxtail in rich beef broth, bilimbi, carrots, potatoes, tomatoes, steamed rice, sambal, crackers", price:125000},
        {id:"dj-sp-tomyum", name:"Tom Yum Melinjo", desc:"Thai-inspired sour soup, prawn, squid, bamboo clams, melinjo leaves, lemongrass, lime, steamed rice", price:86000},
      ]},
      {id:"dj-rice",name:"Prosperous Rice",items:[
        {id:"dj-rc-pepper", name:"Peppercrust Beef", desc:"Stir-fried beef, black pepper sauce, onions, bell peppers, steamed rice", price:72000},
        {id:"dj-rc-nasgor", name:"Nasi Goreng Basmati Kecombrang", desc:"Fried rice, kecombrang paste, egg, sweet soy, braised beef tongue, crackers", price:78000},
        {id:"dj-rc-indo",   name:"Indonesian Fried Rice with Gulai Gravy", desc:"Fried rice, gulai curry gravy, beef ribs", price:72000},
        {id:"dj-rc-brisket",name:"Smoked Brisket Dong Kates", desc:"8-hour smoked beef brisket, seasonal vegetables, BBQ sauce, sambal kecombrang",
         price:98000, options:[{id:"carb",label:"Pilihan Karbo",required:true,choices:["Baby Potatoes","Cassava","Lime Rice"]}]},
        {id:"dj-rc-iga",    name:"Iga Saus Kacang", desc:"Grilled beef ribs, steamed rice, peanut sauce, beef broth, crackers, sambal ijo, vegetables", price:125000},
      ]},
      {id:"dj-pasta",name:"Fusion Pasta",items:[
        {id:"dj-ps-pesto",  name:"Pesto Grilled Chicken", desc:"Fillet chicken leg, al dente pasta, homemade basil pesto",
         price:76000, options:[{id:"pasta",label:"Pilihan Pasta",required:true,choices:["Spaghetti","Fettuccine","Penne","Fusilli"]}]},
        {id:"dj-ps-mushroom",name:"Creamy Mushroom with Onsen Egg", desc:"Wild mushroom cream, shortplate beef, herbs, onsen egg, garlic bread",
         price:88000, options:[{id:"pasta",label:"Pilihan Pasta",required:true,choices:["Spaghetti","Fettuccine","Penne","Fusilli"]}]},
        {id:"dj-ps-aglio",  name:"Pasta Aglio Sambal Matah", desc:"Garlic oil, sambal matah, Balinese gereh keranjang, garlic bread",
         price:68000, options:[{id:"pasta",label:"Pilihan Pasta",required:true,choices:["Spaghetti","Fettuccine","Penne","Fusilli"]}]},
        {id:"dj-ps-bolo",   name:"Rebung Bolognese", desc:"Minced beef, bamboo shoots, rich tomato sauce, garlic bread",
         price:78000, options:[{id:"pasta",label:"Pilihan Pasta",required:true,choices:["Spaghetti","Fettuccine","Penne","Fusilli"]}]},
      ]},
      {id:"dj-noodle",name:"The OG Javanese Noodle",items:[
        {id:"dj-nd-bakmi", name:"Bakmi Goreng Jogja", desc:"Wok-fried egg noodles Javanese style, chicken, duck egg, veggies, garlic, sweet soy", price:62000},
      ]},
      {id:"dj-poultry",name:"Poultry",items:[
        {id:"dj-pt-herbs",  name:"Herbs Roasted Chicken", desc:"Oven-roasted boneless half chicken, herbs, mashed potato, asparagus, mushroom sauce", price:88000},
        {id:"dj-pt-schnitzel",name:"Golden Schnitzel", desc:"Crispy breaded chicken cutlet, baby potato, arugula, balsamic, tartar sauce", price:72000},
        {id:"dj-pt-bakar",  name:"Ayam Bakar Jeruk Purut", desc:"Charcoal grilled half chicken, kaffir lime, sambal kecombrang, crispy curry leaves, steamed rice", price:78000},
        {id:"dj-pt-cordon", name:"Cannon Cordon Bleu", desc:"Fried minced chicken balls, smoked beef, melted cheese, creamy spinach, mashed potato, mushroom sauce", price:82000},
      ]},
      {id:"dj-sea",name:"From the Sea",items:[
        {id:"dj-se-charcoal",name:"Salmon Charcoal", desc:"150gr salmon fillet over charcoal, mashed potato, salad greens, lemon vinaigrette", price:178000},
        {id:"dj-se-seared", name:"Pan-Seared Salmon", desc:"150gr salmon fillet golden crust, sauteed vegetables, creamy mashed potato, light sauce", price:178000},
        {id:"dj-se-laksa",  name:"Salmon Laksa", desc:"150gr salmon fillet, laksa coconut broth, shirataki noodles, vegetables", price:178000},
      ]},
      {id:"dj-beef",name:"Beef",items:[
        {id:"dj-bf-crispy", name:"Beef Crispy", desc:"Served with choice of side, sauce & vegetable",
         price:120000, options:[
           {id:"side",label:"Pilihan Side",required:true,choices:["Fries","Creamy Mashed Potato","Baby Potato","Potato au Gratin","Crispy Belgian Fries"]},
           {id:"sauce",label:"Pilihan Sauce",required:true,choices:["Mushroom Sauce","Chimichurri","Black Pepper Sauce","BBQ Sauce"]},
           {id:"veg",label:"Pilihan Sayur",required:true,choices:["Sauteed Veggies","Creamy Spinach","Buttered Corn","Grilled Asparagus"]}]},
        {id:"dj-bf-nz",     name:"NZ Striploin (200gr)", desc:"Served with choice of side, sauce & vegetable",
         price:290000, options:[
           {id:"side",label:"Pilihan Side",required:true,choices:["Fries","Creamy Mashed Potato","Baby Potato","Potato au Gratin","Crispy Belgian Fries"]},
           {id:"sauce",label:"Pilihan Sauce",required:true,choices:["Mushroom Sauce","Chimichurri","Black Pepper Sauce","BBQ Sauce"]},
           {id:"veg",label:"Pilihan Sayur",required:true,choices:["Sauteed Veggies","Creamy Spinach","Buttered Corn","Grilled Asparagus"]}]},
      ]},
      {id:"dj-skewer",name:"Skewer Selection",items:[
        {id:"dj-sk-klatak", name:"Sate Klatak Balibul", desc:"Young goat meat, salt seasoning, charcoal grilled iron skewers, steamed rice, spiced gulai", price:98000},
        {id:"dj-sk-lilit",  name:"Sate Lilit Ayam", desc:"Balinese minced chicken satay, lemongrass sticks, steamed rice, crackers, urap kenikir", price:78000},
        {id:"dj-sk-maranggi",name:"Sate Maranggi Sapi", desc:"West Javanese marinated beef satay, char-grilled, steamed rice, sambal, shallot pickles", price:120000},
      ]},
      {id:"dj-pizza",name:"Pizza — IDR 88.000",items:[
        {id:"dj-pz-beef",   name:"Beef Supreme", desc:"Tender beef, caramelized onions, melted mozzarella",
         price:88000, options:[{id:"style",label:"Pilihan Adonan",required:true,choices:["Sourdough","Italian Thin Crust"]}]},
        {id:"dj-pz-spinach",name:"Spinach & Cheese", desc:"Homegrown spinach, melted cheese",
         price:88000, options:[{id:"style",label:"Pilihan Adonan",required:true,choices:["Sourdough","Italian Thin Crust"]}]},
        {id:"dj-pz-marg",   name:"Cheese Margherita", desc:"Fresh mozzarella, tomato sauce, basil",
         price:88000, options:[{id:"style",label:"Pilihan Adonan",required:true,choices:["Sourdough","Italian Thin Crust"]}]},
        {id:"dj-pz-mushroom",name:"Mushroom Mania", desc:"Sauteed mushrooms, mozzarella, basil",
         price:88000, options:[{id:"style",label:"Pilihan Adonan",required:true,choices:["Sourdough","Italian Thin Crust"]}]},
      ]},
      {id:"dj-addon",name:"Add-On Sides",items:[
        {id:"dj-ad-rice",  name:"Steamed Rice", desc:"", price:18000},
        {id:"dj-ad-sauce", name:"Extra Sauce", desc:"", price:16000,
         options:[{id:"sauce",label:"Pilihan Sauce",required:true,choices:["Mushroom Sauce","Chimichurri","Black Pepper Sauce","BBQ Sauce"]}]},
        {id:"dj-ad-carbs", name:"Extra Carbs", desc:"", price:28000,
         options:[{id:"carb",label:"Pilihan Karbo",required:true,choices:["Fries","Creamy Mashed Potato","Baby Potato","Potato au Gratin","Crispy Belgian Fries"]}]},
        {id:"dj-ad-veg",   name:"Extra Veggies", desc:"", price:24000,
         options:[{id:"veg",label:"Pilihan Sayur",required:true,choices:["Sauteed Veggies","Creamy Spinach","Buttered Corn","Grilled Asparagus"]}]},
      ]},
      {id:"dj-dessert",name:"Desserts — IDR 42.000",items:[
        {id:"dj-ds-brulee", name:"Honey Sweet Potato Crème Brulée", desc:"Vanilla creme brulee, honey sweet potato, caramelized sugar crust", price:42000},
        {id:"dj-ds-banana", name:"Crispy Banana Cheddar", desc:"Crispy banana, cheddar cheese, choice of syrup, icing sugar", price:42000},
        {id:"dj-ds-cheese", name:"Frosting Cheese Cake", desc:"Creamy cheesecake, cream cheese frosting, biscuit base", price:42000},
        {id:"dj-ds-waffle", name:"Waffle & Gelato", desc:"Freshly baked waffle with gelato",
         price:42000, options:[{id:"gelato",label:"Pilihan Gelato",required:true,choices:["Vanilla","Strawberry","Chocolate"]}]},
        {id:"dj-ds-tira",   name:"Tira; I Miss U", desc:"Espresso-soaked ladyfingers, mascarpone cream, cocoa powder", price:42000},
        {id:"dj-ds-kunyit", name:"Kunyit Mousse", desc:"Turmeric-infused mousse, earthy notes, served chilled", price:42000},
        {id:"dj-ds-klepon", name:"Klepon Pandan Mousse", desc:"Pandan mousse, palm sugar, grated coconut", price:42000},
        {id:"dj-ds-opera",  name:"Opera Cake", desc:"Almond sponge, Indonesian coffee, chocolate ganache, coffee buttercream, dark chocolate glaze", price:42000},
      ]},
      {id:"dj-tea",name:"House of Tea Leaves",items:[
        {id:"dj-te-house", name:"Signature House Tea", desc:"",price:28000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-te-lemon", name:"Classic Lemon Tea", desc:"",price:32000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-te-lychee",name:"Lychee Infused Tea", desc:"",price:34000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-te-peach", name:"Peach Tea", desc:"",price:36000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-te-spark", name:"Lemonade Lychee Sparkler", desc:"",price:38000},
      ]},
      {id:"dj-wellness",name:"Wellness in a Glass — IDR 38.000",items:[
        {id:"dj-wl-yellow",name:"Yellow Splash", desc:"Mango, pineapple, orange", price:38000},
        {id:"dj-wl-berry", name:"Berry Bomb",    desc:"Grape, dragon fruit, strawberry", price:38000},
        {id:"dj-wl-herbal",name:"Herbal Burst",  desc:"Apple, ambarella, kiwi, mint", price:38000},
        {id:"dj-wl-green", name:"Green Detox",    desc:"Cucumber, apple, mustard greens", price:38000},
        {id:"dj-wl-kiwi",  name:"Kiwi Blast",     desc:"Cucumber, pineapple, kiwi, basil", price:38000},
        {id:"dj-wl-juice", name:"Fresh Juice (Single)", desc:"Pilih buah. Mix max 3 buah — tulis di catatan.",
         price:38000, options:[{id:"fruit",label:"Pilihan Buah",required:true,choices:["Mango","Watermelon","Pineapple","Honeydew","Orange","Dragon Fruit"]}]},
      ]},
      {id:"dj-coffee",name:"House of Coffee",items:[
        {id:"dj-cf-espresso", name:"Espresso",     desc:"",price:24000},
        {id:"dj-cf-americano",name:"Americano",    desc:"",price:32000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-cf-conpanna", name:"Conpanna",     desc:"",price:34000},
        {id:"dj-cf-caffelatte",name:"Caffe Latte", desc:"",price:34000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-cf-dolce",    name:"Dolce Latte",   desc:"",price:38000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-cf-affogato", name:"Affogato",      desc:"",price:38000},
        {id:"dj-cf-brownsugar",name:"Brown Sugar Latte", desc:"",price:38000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-cf-caramelmac",name:"Caramel Macchiato Latte", desc:"",price:42000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-cf-cappuccino",name:"Cappuccino",   desc:"",price:42000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-cf-mochaccino",name:"Mochaccino",   desc:"",price:42000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-cf-vanilla",  name:"Vanilla Latte",  desc:"",price:42000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-cf-hazelnut", name:"Hazelnut Latte", desc:"",price:42000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-cf-caramel",  name:"Caramel Latte",  desc:"",price:42000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-cf-geisha",   name:"Geisha Tubruk (Hot)", desc:"",price:85000},
        {id:"dj-cf-lactose",  name:"Free Lactose Milk (Add-on)", desc:"",price:9000},
      ]},
      {id:"dj-milky",name:"Milky Way — IDR 42.000",items:[
        {id:"dj-mw-choco", name:"Chocolate Dream",  desc:"",price:42000},
        {id:"dj-mw-pink",  name:"Pink Potion",       desc:"",price:42000},
        {id:"dj-mw-velvet",name:"Red Velvet",        desc:"",price:42000},
        {id:"dj-mw-blue",  name:"Blue Moon Vanilla", desc:"",price:42000},
      ]},
      {id:"dj-sparkling",name:"Sparkling Mix — IDR 36.000",items:[
        {id:"dj-sm-apple", name:"Apple Mojito",          desc:"",price:36000},
        {id:"dj-sm-berry", name:"Berry Mojita",          desc:"",price:36000},
        {id:"dj-sm-pine",  name:"Pineapple Sunrise",     desc:"",price:36000},
        {id:"dj-sm-mango", name:"Mango Canva",           desc:"",price:36000},
        {id:"dj-sm-rose",  name:"Rosemary Orange Citrus",desc:"",price:36000},
        {id:"dj-sm-shirley",name:"Shirley Temple",       desc:"",price:36000},
      ]},
      {id:"dj-signature",name:"Djiwana Signature — IDR 48.000",items:[
        {id:"dj-sg-ginger",  name:"Daniswara Ginger Hot",   desc:"",price:48000},
        {id:"dj-sg-hanabi",  name:"Hanabi Latte",           desc:"",price:48000},
        {id:"dj-sg-javanese",name:"Iced Javanese Ciwana",   desc:"",price:48000},
        {id:"dj-sg-tropical",name:"Tropical Americano",     desc:"",price:48000},
      ]},
      {id:"dj-caffeine",name:"Caffeine Cloud — IDR 48.000",items:[
        {id:"dj-cc-velvet", name:"Velvet Rouge",     desc:"",price:48000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-cc-matcha", name:"Matcha Green Tea",  desc:"",price:48000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-cc-belgian",name:"Belgian Chocolate", desc:"",price:48000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"dj-cc-golden", name:"Golden Caramel",    desc:"",price:48000,options:[{id:"temp",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
      ]},
      {id:"dj-artisan",name:"Artisan Tea — IDR 48.000",items:[
        {id:"dj-at-apple", name:"Apple Citrus",       desc:"Dried apple, strawberry, goji berry", price:48000},
        {id:"dj-at-citrus",name:"Citrus Mint",        desc:"Green tea, lemongrass, dried mint, dried orange", price:48000},
        {id:"dj-at-bajakah",name:"Red Bajakah",       desc:"Bajakah wood, green tea, dried mint", price:48000},
        {id:"dj-at-rose",  name:"Rose Garden",        desc:"Chamomile, rose bud, marigold flower, spearmint leaf", price:48000},
        {id:"dj-at-mango", name:"Tropical Mango Tea",  desc:"Dried mango, dried mint, black tea", price:48000},
      ]},
      {id:"dj-soft",name:"Soft Drinks & Water",items:[
        {id:"dj-so-coke",  name:"Coca-Cola", desc:"",price:28000,options:[{id:"var",label:"Pilihan",required:true,choices:["Regular","Zero"]}]},
        {id:"dj-so-fanta", name:"Fanta",     desc:"",price:28000},
        {id:"dj-so-sprite",name:"Sprite",    desc:"",price:28000},
        {id:"dj-so-sapa",  name:"Saparella", desc:"",price:28000},
        {id:"dj-so-ron88", name:"Ron88 Mineral Water (330ml)", desc:"",price:22000},
        {id:"dj-so-glacier",name:"Glacier Mineral Water (330ml)", desc:"",price:28000},
        {id:"dj-so-equil", name:"Equil Sparkling Water (330ml)", desc:"",price:36000},
      ]},

    ]
  },
  // ─── KEMANGI BISTRO ───────────────────────────────────────────────────────────
  {
    id:"kemangi",name:"Kemangi Bistro",subtitle:"D1 Welcome Dinner (2 Juli 19.00) & D2 Breakfast (3 Juli 07.00)",
    note:"Kemangi Bistro, Hyatt Regency \u00b7 23 pax \u00b7 Sponsor: HH4 Gerard \u00b7 Harga belum termasuk 21% pajak & service",
    deadline:"25 Juni 2026",
    taxRate:0.21,
    participants: ALL_PAX,
    categories:[
      {id:"km-salad",name:"Salad Appetizer",items:[
        {id:"km-sl-caesar",name:"Classic Caesar Salad",desc:"Romaine, crispy beef bacon, parmesan, croutons, Caesar dressing",
         variants:[{label:"Plain",price:88000},{label:"+ Grilled Chicken",price:103000},{label:"+ Grilled Prawn",price:106000},{label:"+ Poached Egg",price:96000}]},
        {id:"km-sl-kale",name:"Kale Tuna Loin",desc:"Organic kale, quinoa, tuna loin, strawberry, cherry tomatoes, sesame dressing",price:80000},
        {id:"km-sl-garden",name:"Garden Greens",desc:"Mixed greens, carrot, tomato, capsicum, onion, cucumber, balsamic dressing",price:60000},
        {id:"km-sl-salmon",name:"Healthy Salmon Salad",desc:"Salmon gravlax, mixed greens, nuts, feta, pita bread, balsamic vinaigrette",price:120000},
        {id:"km-sl-gado",name:"Gado-Gado Djakarta",desc:"Vegetable salad, bean sprouts, boiled egg, potatoes, bean curd, tempeh, peanut sauce",price:78000},
        {id:"km-sl-lotek",name:"Lotek Jogja",desc:"Steamed vegetables & rice cake, vegetable fritter, peanut sauce",price:74000},
      ]},
      {id:"km-snack",name:"Snack",items:[
        {id:"km-sn-ballen",name:"Beef Cheese Ballen",desc:"Smoked beef, potato & cheese balls, honey mustard",price:78000},
        {id:"km-sn-springroll",name:"Duck and Vegetable Spring Rolls",desc:"Crispy vegetable & sliced duck rolls, Thai chili dip",price:78000},
        {id:"km-sn-fries",name:"Cheese Truffle Fries",desc:"Potato sticks, truffle oil, parmesan, chili tomato sauce",price:68000},
      ]},
      {id:"km-soup",name:"Soup",items:[
        {id:"km-sp-pumpkin",name:"Butternut Pumpkin Soup",desc:"Creamy butternut pumpkin soup, cheese stick",price:75000},
        {id:"km-sp-wonton",name:"Wonton Soup",desc:"Chicken & prawn dumpling soup, mushrooms, baby bok choy",price:80000},
        {id:"km-sp-mushroom",name:"Roasted Forest Mushroom Soup",desc:"Mushroom cream soup, crispy mushrooms, garlic butter bread, truffle oil",price:75000},
      ]},
      {id:"km-signature",name:"Signature Dish",items:[
        {id:"km-sg-buntut",name:"Sop Buntut",desc:"Beef oxtail & vegetable soup, steamed rice, green sambal",price:178000},
        {id:"km-sg-nasgor",name:"Nasi Goreng Kecombrang",desc:"Fried rice, salted fish, bitter beans, bean sprouts, galangal flower, sunny-side-up egg, peanut crackers",price:118000},
        {id:"km-sg-ikan",name:"Ikan Kuah Kemangi",desc:"Pan-fried snapper fillet, yellow curry sauce, sweet basil, vegetables",price:128000},
      ]},
      {id:"km-veg",name:"Vegetarian",items:[
        {id:"km-vg-paratha",name:"Indian Paratha",desc:"Paratha, vegetable stew in curry, mango chutney, yogurt",price:95000},
        {id:"km-vg-kwetiaw",name:"Vegan Fried Kwetiaw",desc:"Flat rice noodles, assorted vegetables, mushrooms, zucchini, cauliflower tempura",price:80000},
        {id:"km-vg-avocado",name:"Vegetable Avocado Roll",desc:"Mixed vegetables & avocado in tortilla, sun-dried tomato pesto, fries",price:80000},
        {id:"km-vg-fruit",name:"Fruit Salad with Strawberry Vinaigrette",desc:"Mixed lettuce, cucumber, pineapple, tomato, olives, corn, strawberries, honey, olive oil",price:80000},
        {id:"km-vg-gulai",name:"Gulai Jamur",desc:"Stewed local mushrooms in red curry sauce, steamed rice",price:80000},
      ]},
      {id:"km-asian",name:"Asian Dish",items:[
        {id:"km-as-duck",name:"Duck Confit Nasi Kecombrang",desc:"Deep-fried crispy duck (half), vegetable urap, steamed rice galangal, sambal bawang, peanut crackers",price:138000},
        {id:"km-as-barramundi",name:"Grilled Barramundi Jimbaran",desc:"Grilled barramundi, Balinese marination, water spinach, bean sprout rice, sambal matah, peanut crackers",price:128000},
        {id:"km-as-kremes",name:"Ayam Kremes",desc:"Crispy fried free-range chicken, cucumber, fried cabbage, lime, basil, bitter beans, lettuce, garlic sambal",price:118000},
        {id:"km-as-konro",name:"Iga Bakar Konro Makassar",desc:"Char-grilled dark beef ribs, steamed rice, cucumber",price:178000},
        {id:"km-as-buntutgoreng",name:"Buntut Goreng Balado",desc:"Fried beef oxtail, spicy chili sauce, beef broth, steamed rice, fresh vegetables",price:168000},
        {id:"km-as-nasgorkampoeng",name:"Nasi Goreng Kampoeng",desc:"Fried rice, shredded chicken, chicken satay, fried egg, prawns",price:118000},
        {id:"km-as-satay",name:"Assorted Satay",desc:"Charcoal-grilled chicken, lamb & beef satay, rice cakes, peanut sauce, sweet ketchup",price:128000},
        {id:"km-as-mietektek",name:"Mie Goreng Tek Tek",desc:"Fried egg noodles Javanese style, chicken, egg, prawns, vegetables, crackers",price:98000},
        {id:"km-as-miegodhog",name:"Mie Godhog Jawa",desc:"Javanese boiled egg noodle soup, shredded chicken, egg, vegetables, crackers",price:98000},
        {id:"km-as-padthai",name:"Pad Thai",desc:"Flat rice noodle, sweet-savory-sour sauce, peanuts, chives, fried tofu, bean sprouts, fried egg",price:128000,
         options:[{id:"protein",label:"Pilihan Protein",required:true,choices:["Beef","Prawn","Chicken"]}]},
        {id:"km-as-soto",name:"Soto Ayam",desc:"Clear chicken soup, glass noodles, vegetables, steamed rice",price:98000},
        {id:"km-as-ayamareh",name:"Ayam Bakar Areh",desc:"Grilled free-range chicken, coconut milk & spices, long beans, sprouts, steamed rice, garlic sambal",price:118000},
      ]},
      {id:"km-main",name:"Main Course",items:[
        {id:"km-mn-surfturf",name:"Surf and Turf",desc:"Grilled Black Angus tenderloin & king prawn, mashed potatoes, sauteed vegetables, duo mix sauce",price:328000},
        {id:"km-mn-fishchips",name:"Fish and Chips",desc:"Fried battered snapper fillet, French fries, tartar sauce",price:108000},
        {id:"km-mn-spring",name:"Roasted Spring Chicken",desc:"Roasted half baby chicken, sauteed vegetables, mashed potatoes, duo mixed sauce",price:150000},
      ]},
      {id:"km-grill",name:"Grill & Hot Stone",items:[
        {id:"km-gr-lobster",name:"Lobster Hot Stone (per 100gr)",desc:"Fresh lobster, garlic butter, cooked on hot stone. Harga per 100gr \u2014 koordinator konfirmasi berat.",
         price:160000,options:[
           {id:"greens",label:"Greens",required:true,choices:["Vegetable of The Day","Mixed Garden Salad"]},
           {id:"side",label:"Side Dish",required:true,choices:["Mashed Potato","French Fries","Herbs Baked Potato","Steamed Rice"]},
           {id:"sauce",label:"Sauce",required:true,choices:["Mushroom","Green Peppercorn","Green Chimichurri","Barbecue","Beurre Blanc","Lemon Butter","Garlic Butter"]}]},
        {id:"km-gr-salmon",name:"Norwegian Salmon",desc:"Sustainable seafood, grilled",price:208000,options:[
           {id:"greens",label:"Greens",required:true,choices:["Vegetable of The Day","Mixed Garden Salad"]},
           {id:"side",label:"Side Dish",required:true,choices:["Mashed Potato","French Fries","Herbs Baked Potato","Steamed Rice"]},
           {id:"sauce",label:"Sauce",required:true,choices:["Mushroom","Green Peppercorn","Green Chimichurri","Barbecue","Beurre Blanc","Lemon Butter","Garlic Butter"]}]},
        {id:"km-gr-tenderloin",name:"Australian Black Angus Tenderloin 170gr",desc:"Grill / hot stone",price:388000,options:[
           {id:"greens",label:"Greens",required:true,choices:["Vegetable of The Day","Mixed Garden Salad"]},
           {id:"side",label:"Side Dish",required:true,choices:["Mashed Potato","French Fries","Herbs Baked Potato","Steamed Rice"]},
           {id:"sauce",label:"Sauce",required:true,choices:["Mushroom","Green Peppercorn","Green Chimichurri","Barbecue","Beurre Blanc","Lemon Butter","Garlic Butter"]}]},
        {id:"km-gr-sirloin",name:"Australian Black Angus Sirloin 200gr",desc:"Grill / hot stone",price:318000,options:[
           {id:"greens",label:"Greens",required:true,choices:["Vegetable of The Day","Mixed Garden Salad"]},
           {id:"side",label:"Side Dish",required:true,choices:["Mashed Potato","French Fries","Herbs Baked Potato","Steamed Rice"]},
           {id:"sauce",label:"Sauce",required:true,choices:["Mushroom","Green Peppercorn","Green Chimichurri","Barbecue","Beurre Blanc","Lemon Butter","Garlic Butter"]}]},
        {id:"km-gr-ribeye",name:"Australian Black Angus Rib Eye 200gr",desc:"Grill / hot stone",price:358000,options:[
           {id:"greens",label:"Greens",required:true,choices:["Vegetable of The Day","Mixed Garden Salad"]},
           {id:"side",label:"Side Dish",required:true,choices:["Mashed Potato","French Fries","Herbs Baked Potato","Steamed Rice"]},
           {id:"sauce",label:"Sauce",required:true,choices:["Mushroom","Green Peppercorn","Green Chimichurri","Barbecue","Beurre Blanc","Lemon Butter","Garlic Butter"]}]},
      ]},
      {id:"km-sandwich",name:"Sandwich",items:[
        {id:"km-sw-wagyu",name:"Wagyu Beef Burger",desc:"Lettuce, gherkins, onions, tomatoes, cheese, mayonnaise, French fries",price:138000},
        {id:"km-sw-club",name:"Club Sandwich",desc:"Romaine, tomatoes, chicken, fried egg, beef bacon, mayonnaise, French fries",price:118000},
        {id:"km-sw-panini",name:"Grilled Salmon Panini",desc:"Feta, dill mayonnaise, onion, cheddar, sourdough, mixed greens, potato chips",price:108000},
        {id:"km-sw-pita",name:"Healthy Chicken Avocado Pita Sandwich",desc:"Roasted chicken, avocado, romaine, garlic yogurt sauce, pita",price:118000},
        {id:"km-sw-bagel",name:"Salmon Gravlax Bagel",desc:"Bagel, salmon gravlax, herb cream cheese, shallot pickle, fried capers, dill, mixed lettuce, fries",price:118000},
        {id:"km-sw-croque",name:"Croque Madam",desc:"Sourdough, smoked beef, cheese, sunny-side-up egg, French fries",price:108000},
        {id:"km-sw-pullbeef",name:"8 Hours Pull Beef Texas BBQ Sourdough Sandwich",desc:"Pulled beef, pesto butter, cream, melted cheese, jalapenos, gherkins, lettuce, French fries",price:135000},
      ]},
      {id:"km-pasta",name:"Pasta",items:[
        {id:"km-ps-pomodoro",name:"Spaghetti Pomodoro",desc:"Tomato sauce, basil, parmesan",price:86000},
        {id:"km-ps-lorenzo",name:"Spaghetti Lorenzo",desc:"Mixed seafood, olive oil, asparagus, garlic, dried tomatoes, chili",price:110000},
        {id:"km-ps-carbonara",name:"Fusili Carbonara",desc:"Parmesan, egg yolk, beef bacon",price:110000},
        {id:"km-ps-linguini",name:"Linguini Short Plate Mushroom",desc:"Gravy & light cream, basil, tomato, grilled beef, mushrooms",price:115000},
        {id:"km-ps-penne",name:"Penne Cream Basil Pesto",desc:"Toasted penne, basil, grilled chicken, cheese",price:108000},
        {id:"km-ps-fettuccine",name:"Fettuccine Bolognese",desc:"Traditional Bolognese sauce",price:110000},
      ]},
      {id:"km-pizza",name:"Pizza",items:[
        {id:"km-pz-buffalo",name:"Buffalo Chicken Calzone",desc:"Grilled chicken, spinach, mozzarella, barbeque sauce, tomato base",price:108000},
        {id:"km-pz-classic",name:"Classic Calzone",desc:"Beef ragout, smoked beef, mushrooms, mozzarella, tomato base",price:108000},
        {id:"km-pz-margherita",name:"Margherita",desc:"Mozzarella, basil, tomato base",price:98000},
        {id:"km-pz-supreme",name:"Supreme",desc:"Mushrooms, chicken, smoked beef, tomatoes, mozzarella, tomato base",price:108000},
        {id:"km-pz-meatlover",name:"Meat Lover Pizza",desc:"Pepperoni, bacon, beef ragout, mozzarella, tomato base",price:118000},
        {id:"km-pz-rustica",name:"Rustica",desc:"Mushrooms, smoked beef, arugula, parmesan, tomato sauce",price:108000},
        {id:"km-pz-salmon",name:"Smoked Salmon Pizza",desc:"Smoked salmon, mozzarella, basil pesto, tomato base",price:118000},
      ]},
      {id:"km-kids",name:"For Little One",items:[
        {id:"km-ki-pizzabambini",name:"Pizza Bambini",desc:"Tomato base, mozzarella, basil",price:50000},
        {id:"km-ki-boots",name:"Boots Burger",desc:"Small burger, cheese, French fries",price:50000},
        {id:"km-ki-hotdog",name:"Ducky Hot Dog",desc:"Hot dog, tomato sauce, French fries",price:45000},
        {id:"km-ki-spaghetti",name:"Mickey Spaghetti",desc:"Spaghetti with Bolognese sauce",price:45000},
        {id:"km-ki-friedrice",name:"Upin Ipin Fried Rice",desc:"Chicken fried rice, egg, chicken drumstick",price:45000},
        {id:"km-ki-nugget",name:"Moana Chicken",desc:"Chicken nugget, French fries, cheese dip",price:45000},
        {id:"km-ki-fishchip",name:"Patrick Fish Chip",desc:"Fried battered snapper fillet, French fries, tartar sauce",price:45000},
      ]},
      {id:"km-dessert",name:"Dessert",items:[
        {id:"km-ds-tiramisu",name:"Tiramisu",desc:"Mascarpone mousse, ladyfingers, double espresso, cocoa",price:68000},
        {id:"km-ds-klepon",name:"Klepon Pannacotta",desc:"Pandan coconut milk panna cotta, palm sugar, crushed nuts, dried coconut, vanilla ice cream",price:68000},
        {id:"km-ds-lava",name:"Chocolate Lava Cake",desc:"Chocolate cake with rum raisin ice cream",price:68000},
        {id:"km-ds-cheesecake",name:"Double Chocolate Cheese Cake",desc:"Cheesecake, smoked burnt, strawberry sauce",price:68000},
        {id:"km-ds-pisang",name:"Pisang Goreng Crispy",desc:"Banana fritters, palm sugar, condensed milk, icing sugar, shredded cheese",price:68000},
        {id:"km-ds-fruit",name:"Tropical Fresh Fruit",desc:"Slices of tropical seasonal fruits",price:58000},
        {id:"km-ds-gelato",name:"Homemade Gelato & Sorbet (2 scoops)",desc:"Pilih 2 scoop",price:68000,
         options:[
           {id:"scoop1",label:"Scoop 1",required:true,choices:["Gelato Kecombrang","Gelato Vanilla","Gelato Chocolate","Gelato Mocca","Gelato Choco Hazelnut","Gelato Mango","Gelato Taro","Gelato Klepon","Sorbet Kecombrang","Sorbet Soursop","Sorbet Lime"]},
           {id:"scoop2",label:"Scoop 2",required:true,choices:["Gelato Kecombrang","Gelato Vanilla","Gelato Chocolate","Gelato Mocca","Gelato Choco Hazelnut","Gelato Mango","Gelato Taro","Gelato Klepon","Sorbet Kecombrang","Sorbet Soursop","Sorbet Lime"]}]},
      ]},
      {id:"km-healthjuice",name:"Health Juice",items:[
        {id:"km-hj-kemango",name:"Kemango Splash",desc:"Puree mango, orange, basil leaf",price:55000},
        {id:"km-hj-yellow",name:"Yellow Sunrise",desc:"Pineapple, honey, banana, orange",price:55000},
        {id:"km-hj-lychia",name:"Lychia",desc:"Lychee, apple, cucumber, honey",price:55000},
        {id:"km-hj-morning",name:"Morning in Glory",desc:"Apple, ginger, pineapple, rosemary",price:55000},
        {id:"km-hj-greeny",name:"Greeny",desc:"Broccoli, bok choy, honey, lime, orange",price:55000},
        {id:"km-hj-wildlychee",name:"Wild Lychee",desc:"Lychee, plain yogurt, lime juice, vanilla syrup, lemon leaf",price:55000},
      ]},
      {id:"km-juice",name:"Fresh Squeezed Juice",items:[
        {id:"km-fj-60",name:"Fresh Juice",desc:"Pilih satu",price:60000,options:[{id:"fruit",label:"Pilihan",required:true,choices:["Orange","Avocado","Carrot","Pineapple","Mixed"]}]},
        {id:"km-fj-50",name:"Fresh Juice",desc:"Pilih satu",price:50000,options:[{id:"fruit",label:"Pilihan",required:true,choices:["Papaya","Honeydew","Guava","Strawberry","Watermelon","Red Dragon Fruit"]}]},
      ]},
      {id:"km-cold",name:"Mocktails / Milkshakes / Smoothies",items:[
        {id:"km-cd-lycheeberry",name:"Lychee Berry (Mocktail)",desc:"Lychee strawberry syrup, vanilla ice cream, marshmallows, soda",price:52000},
        {id:"km-cd-punch",name:"Kemangi Punch (Mocktail)",desc:"Orange, pineapple, grenadine syrup, blue pea flower",price:52000},
        {id:"km-cd-mojito",name:"Virgin Mojito (Mocktail)",desc:"Mint leaf, lime juice, soda water, sugar",price:52000},
        {id:"km-cd-fiz",name:"Kecombrang Fiz (Mocktail)",desc:"Homemade wild ginger flower syrup, soda",price:52000},
        {id:"km-cd-milkshake",name:"Milkshake",desc:"Pilih rasa",price:50000,options:[{id:"rasa",label:"Rasa",required:true,choices:["Strawberry","Vanilla","Chocolate"]}]},
        {id:"km-cd-smoothie",name:"Smoothie",desc:"Pilih rasa",price:52000,options:[{id:"rasa",label:"Rasa",required:true,choices:["Strawberry","Banana","Pineapple","Avocado"]}]},
      ]},
      {id:"km-hot",name:"Hot Beverage & Others",items:[
        {id:"km-ht-coconut",name:"Young Coconut",desc:"Fresh whole coconut, slice lime, simple syrup",price:50000},
        {id:"km-ht-infused",name:"Infused Water",desc:"Mineral water with sliced fruit, served in pitcher",price:45000},
        {id:"km-ht-choc",name:"Hot Chocolate",desc:"Dark chocolate, fresh milk, marshmallow",price:45000},
        {id:"km-ht-jahe",name:"Wedang Jahe",desc:"Homemade hot ginger drink, honey on the side",price:42000},
        {id:"km-ht-uwuh",name:"Wedang Uwuh",desc:"Secang wood, cinnamon, ginger, clove, nutmeg leaf, lemongrass, cardamom",price:42000},
      ]},
      {id:"km-coffeetea",name:"Coffee & Tea",items:[
        {id:"km-ct-coffee",name:"Coffee",desc:"Pilih jenis",price:45000,options:[{id:"jenis",label:"Pilihan Kopi",required:true,choices:["Espresso","Double Espresso","Long Black","Americano","Cappuccino","Caffe Latte"]}]},
        {id:"km-ct-flavour",name:"Flavour Coffee",desc:"Pilih rasa & suhu",price:45000,options:[{id:"rasa",label:"Rasa",required:true,choices:["Caramel Latte","Hazelnut Coffee","Palm Sugar"]},{id:"suhu",label:"Suhu",required:true,choices:["Hot","Ice"]}]},
        {id:"km-ct-tea",name:"Loose Leaf Tea",desc:"Pilih teh",price:42000,options:[{id:"teh",label:"Pilihan Teh",required:true,choices:["English Breakfast","Earl Grey","Jasmine","Java","Green","Darjeeling","Peppermint","Chamomile","Chinese Tea"]}]},
        {id:"km-ct-icedtea",name:"Iced Tea",desc:"Pilih rasa",price:42000,options:[{id:"rasa",label:"Rasa",required:true,choices:["Java","Lime","Lemon","Lychee"]}]},
        {id:"km-ct-squash",name:"Squash",desc:"Pilih rasa",price:45000,options:[{id:"rasa",label:"Rasa",required:true,choices:["Lime","Lemon","Orange","Peach","Lychee","Strawberry"]}]},
      ]},
      {id:"km-soft",name:"Soft Drink & Water",items:[
        {id:"km-sf-soda",name:"Soft Drink",desc:"Pilih",price:35000,options:[{id:"jenis",label:"Pilihan",required:true,choices:["Coke","Coke Zero","Sprite"]}]},
        {id:"km-sf-equil",name:"Equil Mineral Water",desc:"",price:39000},
        {id:"km-sf-equilsparkling",name:"Equil Sparkling Water",desc:"",price:39000},
      ]},
    ]
  },
  // ─── BAKPIA PATHOK 25 ────────────────────────────────────────────────────────
  {
    id:"bakpia",name:"Bakpia Pathok 25",subtitle:"D4 · Oleh-oleh Takeaway · 5 Juli 2026",
    note:"Bakpia Pathok 25, Yogyakarta · 23 pax · Dikoordinir, bayar langsung 5 Juli",
    deadline:"25 Juni 2026",
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
  // ─── JUWARA SATOE ─────────────────────────────────────────────────────────────
  {
    id:"juwara",name:"Juwara Satoe",subtitle:"D4 · Oleh-oleh Takeaway · 5 Juli 2026",
    note:"Bakpia Juwara Satoe, Yogyakarta · 23 pax · Dikoordinir, bayar langsung 5 Juli",
    deadline:"25 Juni 2026",
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
  // ─── WAHYU AUSTIN PASTRY ──────────────────────────────────────────────────────
  {
    id:"wahyu-austin",name:"Wahyu Austin Pastry",subtitle:"D4 · Oleh-oleh Takeaway · 5 Juli 2026",
    note:"Roll Cake 4×30 cm · 23 pax · Dikoordinir, bayar langsung 5 Juli",
    deadline:"25 Juni 2026",
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
  // ─── PUTU RADJA BOLU PISANG ───────────────────────────────────────────────────
  {
    id:"putu-radja",name:"Putu Radja Bolu Pisang",subtitle:"D4 · Oleh-oleh Takeaway · 5 Juli 2026",
    note:"Putu Radja, Yogyakarta · 23 pax · Dikoordinir, bayar langsung 5 Juli",
    deadline:"25 Juni 2026",
    isTakeaway:true,
    participants: ALL_PAX,
    categories:[
      {id:"pr-whole",name:"Bolu Whole",items:[
        {id:"pr-wh-ori",    name:"Bolu Pisang Original",        desc:"Bolu Whole · 1 loaf",  price:99000},
        {id:"pr-wh-kelapa", name:"Bolu Pisang Kelapa",          desc:"Bolu Whole · 1 loaf",  price:110000},
        {id:"pr-wh-cok",    name:"Bolu Pisang Coklat",          desc:"Bolu Whole · 1 loaf",  price:130000},
        {id:"pr-wh-keju",   name:"Bolu Pisang Keju",            desc:"Bolu Whole · 1 loaf",  price:130000},
        {id:"pr-wh-straw",  name:"Bolu Pisang Strawberry",      desc:"Bolu Whole · 1 loaf",  price:130000},
        {id:"pr-wh-cin",    name:"Bolu Pisang Cinnamon",        desc:"Bolu Whole · 1 loaf",  price:145000},
        {id:"pr-wh-pis",    name:"Bolu Pisang Pistachio Kunafa",desc:"Bolu Whole · 1 loaf",  price:165000},
      ]},
      {id:"pr-slice",name:"Bolu Slice",items:[
        {id:"pr-sl-ori",    name:"Bolu Pisang Original",        desc:"Bolu Slice · per slice", price:20000},
        {id:"pr-sl-kelapa", name:"Bolu Pisang Kelapa",          desc:"Bolu Slice · per slice", price:20000},
        {id:"pr-sl-keju",   name:"Bolu Pisang Keju",            desc:"Bolu Slice · per slice", price:25000},
        {id:"pr-sl-straw",  name:"Bolu Pisang Strawberry",      desc:"Bolu Slice · per slice", price:25000},
        {id:"pr-sl-cok",    name:"Bolu Pisang Coklat",          desc:"Bolu Slice · per slice", price:27000},
        {id:"pr-sl-cin",    name:"Bolu Pisang Cinnamon",        desc:"Bolu Slice · per slice", price:27000},
        {id:"pr-sl-pis",    name:"Bolu Pisang Pistachio Kunafa",desc:"Bolu Slice · per slice", price:30000},
      ]},
      {id:"pr-addon",name:"Pilihan Butter Add-Ons — IDR 10.000 / spoon",items:[
        {id:"pr-ad-cheese",   name:"Butter Cheese",     desc:"Add-on · 1 spoon", price:10000},
        {id:"pr-ad-choco",    name:"Butter Chocolate",  desc:"Add-on · 1 spoon", price:10000},
        {id:"pr-ad-cin",      name:"Butter Cinnamon",   desc:"Add-on · 1 spoon", price:10000},
        {id:"pr-ad-straw",    name:"Butter Strawberry", desc:"Add-on · 1 spoon", price:10000},
        {id:"pr-ad-coconut",  name:"Butter Coconut",    desc:"Add-on · 1 spoon", price:10000},
        {id:"pr-ad-pistachio",name:"Butter Pistachio",  desc:"Add-on · 1 spoon", price:10000},
      ]},
    ]
  },
];

// ── PATCH 1: Tentrem Summer Palace removed from UPCOMING_FB ─────────────────
const UPCOMING_FB = [
];

const SET_MENUS = [
  {
    id:"mbah-mo", name:"Mbah Mo", subtitle:"D2 · Makan Siang · 3 Juli 2026, 12.00",
    sponsor:"HH3 · Monang", pax:23,
    note:"Hidangan buffet bersama — sudah ditentukan, tidak perlu memesan.",
    sections:[
      {label:"Welcome Drink", items:["Es Kuwud"]},
      {label:"Prasmanan", items:[
        "Nasi Putih (free refill)",
        "Ayam Kampung 1/4 Panggang",
        "Lalap Sambal",
        "Pecel Madiun",
        "Oseng Tahu Tempe",
        "Garang Asem",
        "Sayur Sop",
        "Oseng Daun Pepaya",
        "Mendoan",
        "Pisang Goreng",
        "Kerupuk + Buah Potong",
      ]},
      {label:"Minuman", items:["Teh / Es Teh (free refill)"]},
    ]
  },
  {
    id:"desa-palagan", name:"Desa Palagan", subtitle:"D3 \u00b7 Sarapan \u00b7 4 Juli 2026, 07.00",
    sponsor:"HH2 \u00b7 Agustinus", pax:23,
    note:"Restoran Indonesia konsep all-you-can-eat buffet \u2014 tidak ada menu yang perlu dipilih. Ambil sepuasnya di lokasi.",
    sections:[
      {label:"Format", items:["Prasmanan All-You-Can-Eat \u2014 aneka hidangan Indonesia disajikan di lokasi"]},
    ]
  },
];

const fmt = n => "IDR " + Math.abs(Number(n)).toLocaleString("id-ID");
const pct = (a,b) => b>0?Math.min(100,Math.round((a/b)*100)):0;

const useIsNarrow = (bp=640) => {
  const [narrow,setNarrow] = useState(typeof window!=="undefined" && window.innerWidth < bp);
  useEffect(()=>{
    const on = () => setNarrow(window.innerWidth < bp);
    window.addEventListener("resize",on);
    return () => window.removeEventListener("resize",on);
  },[bp]);
  return narrow;
};

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
        <p style={{fontSize:"14px",letterSpacing:"4px",textTransform:"uppercase",color:T.muted,marginBottom:"32px"}}>Yogyakarta · 2–5 Juli 2026</p>
        <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"42px",fontWeight:400,color:T.ink,marginBottom:"8px",letterSpacing:"-0.5px",lineHeight:1.1}}>Pomp Op Sahat</h1>
        <p style={{fontSize:"16px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"56px"}}>Hyatt Regency Yogyakarta</p>
        <div style={{marginBottom:err?"8px":"24px"}}>
          <input ref={inputRef} type="password" value={val} onChange={e=>{setVal(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&submit()}
            placeholder="Kata sandi" style={{width:"100%",padding:"16px 0",borderTop:"none",borderLeft:"none",borderRight:"none",borderBottom:`1px solid ${err?T.danger:T.lineD}`,background:"transparent",fontSize:"18px",letterSpacing:"1px",color:T.ink,outline:"none",textAlign:"center"}} />
        </div>
        {err && <p style={{fontSize:"15px",color:T.danger,letterSpacing:"1px",marginBottom:"16px",textTransform:"uppercase"}}>Kata sandi tidak tepat</p>}
        <button onClick={submit} style={{background:"none",border:"none",cursor:"pointer",fontSize:"15px",letterSpacing:"3px",textTransform:"uppercase",color:T.forest,padding:"12px 0",fontWeight:500,borderBottom:`1px solid ${T.forest}`}}>Masuk</button>
        <p style={{marginTop:"48px",fontSize:"14px",color:T.ghost,letterSpacing:"1px"}}>Hubungi koordinator untuk kata sandi</p>
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
        <p style={{fontSize:"14px",letterSpacing:"4px",textTransform:"uppercase",color:T.muted,marginBottom:"32px"}}>Selamat datang</p>
        <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"36px",fontWeight:400,color:T.ink,marginBottom:"48px"}}>Siapa Anda?</h2>
        <select value={sel} onChange={e=>setSel(e.target.value)} style={{width:"100%",padding:"16px 0",border:"none",borderBottom:`1px solid ${T.lineD}`,background:"transparent",fontSize:"18px",color:sel?T.ink:T.muted,outline:"none",cursor:"pointer",appearance:"none",textAlign:"center"}}>
          <option value="">Pilih nama Anda</option>
          {ALL_PAX.map(p=><option key={p.name} value={p.name}>{p.name} ({p.hh})</option>)}
        </select>
        <div style={{marginTop:"40px"}}>
          <button onClick={()=>sel&&onSuccess(sel)} disabled={!sel} style={{background:"none",border:"none",cursor:sel?"pointer":"default",fontSize:"15px",letterSpacing:"3px",textTransform:"uppercase",color:sel?T.forest:T.ghost,padding:"12px 0",fontWeight:500,borderBottom:`1px solid ${sel?T.forest:T.ghost}`,transition:"all 0.2s"}}>Lanjutkan</button>
        </div>
      </div>
    </div>
  );
});

const Shell = ({user,tab,setTab,children,muted,onToggleMute}) => {
  const TABS = [{id:"itinerary",label:"Itinerary"},{id:"size",label:"Ukuran Pakaian"},{id:"makan",label:"Pesan Makanan"},{id:"oleholeh",label:"Oleh-Oleh"},{id:"budget",label:"Dana"}];
  return (
    <div style={{minHeight:"100vh",background:T.stone}}>
      <GlobalStyles/>
      <header style={{background:T.stone,borderBottom:`1px solid ${T.line}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:"960px",margin:"0 auto",padding:"0 40px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0 16px",borderBottom:`1px solid ${T.line}`}}>
            <div>
              <h1 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"23px",fontWeight:400,color:T.ink,letterSpacing:"-0.3px"}}>Pomp Op Sahat</h1>
              <p style={{fontSize:"14px",letterSpacing:"2.5px",textTransform:"uppercase",color:T.muted,marginTop:"3px"}}>Yogyakarta · Hyatt Regency · 2–5 Juli 2026 · 23 Peserta</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
              <button onClick={onToggleMute} aria-label={muted?"Nyalakan musik":"Senyapkan musik"} title={muted?"Nyalakan musik":"Senyapkan musik"} style={{background:"none",border:"none",cursor:"pointer",padding:"4px",color:muted?T.ghost:T.forest,lineHeight:0}}>
                {muted
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>}
              </button>
              <p style={{fontSize:"15px",color:T.muted}}>Halo, <span style={{color:T.ink,fontWeight:500}}>{user}</span></p>
            </div>
          </div>
          <nav style={{display:"flex"}}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",padding:"16px 28px 14px",cursor:"pointer",fontSize:"15px",letterSpacing:"2px",textTransform:"uppercase",fontWeight:tab===t.id?500:300,color:tab===t.id?T.forest:T.muted,borderBottom:tab===t.id?`2px solid ${T.forest}`:"2px solid transparent",transition:"all 0.2s",marginBottom:"-1px"}}>{t.label}</button>
            ))}
          </nav>
        </div>
      </header>
      <main style={{maxWidth:"960px",margin:"0 auto",padding:"60px 40px"}}>{children}</main>
      <footer style={{borderTop:`1px solid ${T.line}`,padding:"32px 40px",textAlign:"center"}}>
        <p style={{fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",color:T.ghost}}>Konfidensial · Pomp Op Sahat 2026 · Yogyakarta</p>
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
  const [revealed,setRevealed] = useState(false);
  const [pwOpen,setPwOpen] = useState(false);
  const [pw,setPw] = useState("");
  const [pwErr,setPwErr] = useState(false);
  const MASK = "••••••";
  const show = v => revealed ? fmt(v) : `IDR ${MASK}`;
  const tryReveal = () => { if(pw.trim().toLowerCase()==="lihatdana"){ setRevealed(true); setPwOpen(false); setPw(""); setPwErr(false); } else setPwErr(true); };

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
        <p style={{fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"12px"}}>Dana Bersama</p>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"20px",flexWrap:"wrap"}}>
          <div>
            <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"34px",fontWeight:400,color:T.ink,marginBottom:"8px"}}>Ringkasan Keuangan</h2>
            <p style={{fontSize:"16px",color:T.muted}}>Per {d.lastSync} · Data dari Lusiana{syncedAt && <span style={{color:T.ghost}}> · Live {syncedAt.toLocaleTimeString("id-ID")}</span>}</p>
          </div>
          <div style={{flexShrink:0}}>
            <button onClick={()=>{ if(revealed){setRevealed(false);} else {setPwOpen(o=>!o);setPwErr(false);} }} style={{display:"flex",alignItems:"center",gap:"8px",background:revealed?T.cream:"none",border:`1px solid ${revealed?T.forest:T.lineD}`,padding:"9px 16px",cursor:"pointer",fontSize:"13px",letterSpacing:"1.5px",textTransform:"uppercase",color:revealed?T.forest:T.muted}}>
              {revealed
                ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22"/></svg>
                : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>}
              {revealed ? "Sembunyikan" : "Lihat Angka"}
            </button>
            {pwOpen && !revealed && (
              <div style={{marginTop:"12px",display:"flex",flexDirection:"column",gap:"8px",width:"220px",marginLeft:"auto"}}>
                <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setPwErr(false);}} onKeyDown={e=>e.key==="Enter"&&tryReveal()} placeholder="Password lihat dana" autoFocus
                  style={{padding:"10px 12px",border:`1px solid ${pwErr?T.danger:T.lineD}`,background:"white",fontSize:"15px",color:T.ink,outline:"none"}}/>
                <button onClick={tryReveal} style={{background:T.forest,color:"white",border:"none",padding:"10px",cursor:"pointer",fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",fontWeight:500}}>Buka</button>
                {pwErr&&<p style={{fontSize:"13px",color:T.danger}}>Password salah.</p>}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"1px",background:T.line,marginBottom:"64px"}}>
        {[
          {label:"Total Dana",val:show(d.totals.gross),sub:"Dana bersama"},
          {label:"Per Peserta",val:show(d.perPax),sub:"Kontribusi"},
          {label:"Terkumpul",val:show(d.totals.deposit),sub:`${collection}% dari target`,hi:T.settled},
          {label:"Belum Lunas",val:show(Math.max(0,-d.totals.balance)),sub:"Outstanding",hi:d.totals.balance<0?T.danger:T.settled},
        ].map(k=>(
          <div key={k.label} style={{background:T.cream,padding:"32px 28px"}}>
            <p style={{fontSize:"14px",letterSpacing:"2.5px",textTransform:"uppercase",color:T.muted,marginBottom:"16px"}}>{k.label}</p>
            <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"26px",fontWeight:400,color:k.hi||T.ink,lineHeight:1,marginBottom:"8px"}}>{k.val}</p>
            <p style={{fontSize:"15px",color:T.muted}}>{k.sub}</p>
          </div>
        ))}
      </div>

      <div style={{marginBottom:"64px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"12px"}}>
          <p style={{fontSize:"14px",letterSpacing:"2.5px",textTransform:"uppercase",color:T.muted}}>Tingkat Pelunasan</p>
          <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"23px",color:T.ink}}>{collection}%</p>
        </div>
        <div style={{height:"1px",background:T.line,position:"relative"}}>
          <div style={{position:"absolute",top:0,left:0,height:"2px",width:`${collection}%`,background:T.forest,marginTop:"-0.5px",transition:"width 1s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:"8px"}}>
          <p style={{fontSize:"14px",color:T.muted}}>Terkumpul: {show(d.totals.deposit)}</p>
          <p style={{fontSize:"14px",color:T.muted}}>Target: {show(d.totals.gross)}</p>
        </div>
      </div>

      <div style={{marginBottom:"64px"}}>
        <p style={{fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"32px"}}>Posisi Per Household</p>
        <div style={{borderTop:`1px solid ${T.line}`}}>
          {d.households.map(hh=>{
            const isOwn=hh.id===myHH, absorbed=hh.absorbed;
            const settled=!absorbed&&hh.balance>=0;
            const statusColor=absorbed?T.abs:settled?T.settled:T.danger;
            const statusLabel=absorbed?"Absorbed":settled?"Settled":hh.deposit>0?"Belum Lunas":"Belum Bayar";
            const canSee=isCoord||isOwn||settled;
            return (
              <div key={hh.id} style={{borderBottom:`1px solid ${T.line}`,padding:"32px 0",position:"relative"}}>
                {isOwn&&<div style={{position:"absolute",left:"-40px",top:0,bottom:0,width:"2px",background:T.gold}}/>}
                <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"24px",alignItems:"start"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"6px",flexWrap:"wrap"}}>
                      <h3 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"21px",fontWeight:400,color:T.ink}}>{hh.lead}</h3>
                      {isOwn&&<span style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:T.gold,border:`1px solid ${T.gold}`,padding:"2px 8px"}}>Anda</span>}
                    </div>
                    <p style={{fontSize:"15px",color:T.muted,marginBottom:canSee&&!absorbed?"20px":"0"}}>{hh.id} · {hh.pax} peserta · {hh.members.join(", ")}</p>
                    {canSee&&!absorbed&&(
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,160px)",gap:"24px"}}>
                        {[
                          {l:"Total",v:show(hh.gross),c:T.ink},
                          {l:"Dibayar",v:show(hh.deposit),c:T.settled},
                          {l:hh.balance>=0?"Credit":"Sisa Bayar",v:show(Math.abs(hh.balance)),c:hh.balance>=0?T.settled:T.danger},
                        ].map(f=>(
                          <div key={f.l}>
                            <p style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"6px"}}>{f.l}</p>
                            <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"21px",color:f.c,fontWeight:400}}>{f.v}</p>
                            {hh.gross>0&&f.l==="Dibayar"&&<div style={{marginTop:"6px",height:"1px",background:T.line}}><div style={{height:"1px",width:`${pct(hh.deposit,hh.gross)}%`,background:T.settled}}/></div>}
                          </div>
                        ))}
                      </div>
                    )}
                    {isCoord&&hh.id==="HH4"&&hh.subRows?.length>0&&(
                      <div style={{marginTop:"20px",borderTop:`1px solid ${T.line}`,paddingTop:"16px"}}>
                        <p style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"12px"}}>Sub-unit HH4</p>
                        {hh.subRows.map((s,i)=>(
                          <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 60px 120px 100px",gap:"16px",padding:"8px 0",borderBottom:`1px solid ${T.line}`,fontSize:"16px",alignItems:"center"}}>
                            <span style={{color:T.mid}}>{s.members}</span>
                            <span style={{color:T.muted,textAlign:"right"}}>{s.pax}px</span>
                            <span style={{color:T.settled,textAlign:"right"}}>{show(s.deposit)}</span>
                            <span style={{color:s.balance>=0?T.settled:T.danger,textAlign:"right",fontWeight:500}}>{s.balance>=0?"+":""}{revealed?fmt(s.balance):MASK}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {absorbed&&<p style={{fontSize:"15px",color:T.abs,fontStyle:"italic",marginTop:"4px"}}>{hh.note}</p>}
                    {!canSee&&!absorbed&&<p style={{fontSize:"15px",color:T.muted,fontStyle:"italic",marginTop:"4px"}}>Detail hanya tersedia untuk household Anda.</p>}
                  </div>
                  <p style={{fontSize:"14px",letterSpacing:"1.5px",textTransform:"uppercase",color:statusColor,fontWeight:500,marginTop:"4px",whiteSpace:"nowrap"}}>{statusLabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{marginBottom:"64px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",marginBottom:"32px"}}>
          <p style={{fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted}}>Riwayat Transaksi</p>
          {syncedAt&&<p style={{fontSize:"14px",color:T.ghost}}>Live · {syncedAt.toLocaleTimeString("id-ID")}</p>}
        </div>
        {ledger.length===0
          ? <p style={{fontSize:"16px",color:T.muted,fontStyle:"italic"}}>Memuat data transaksi…</p>
          : <>
            <div style={{display:"grid",gridTemplateColumns:"32px 100px 80px 1fr 120px 120px 130px",gap:"0 16px",padding:"0 0 10px",borderBottom:`2px solid ${T.line}`}}>
              {["No","Tanggal","Tipe","Keterangan","Deposit (+)","Refund (−)","Saldo"].map(h=>(
                <p key={h} style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,textAlign:["Deposit (+)","Refund (−)","Saldo"].includes(h)?"right":"left"}}>{h}</p>
              ))}
            </div>
            {ledger.map((row,i)=>{
              const isDeposit = row.tipe==="Deposit";
              const isRefund  = row.tipe==="Refund";
              const typeColor = isDeposit ? T.settled : isRefund ? T.warn : T.danger;
              return (
                <div key={i} style={{display:"grid",gridTemplateColumns:"32px 100px 80px 1fr 120px 120px 130px",gap:"0 16px",padding:"13px 0",borderBottom:`1px solid ${T.line}`,alignItems:"center"}}>
                  <p style={{fontSize:"15px",color:T.ghost}}>{row.no}</p>
                  <p style={{fontSize:"15px",color:T.muted}}>{row.tanggal}</p>
                  <p style={{fontSize:"14px",letterSpacing:"1px",textTransform:"uppercase",color:typeColor,fontWeight:500}}>{row.tipe}</p>
                  <div>
                    <p style={{fontSize:"16px",color:T.ink}}>{row.keterangan}</p>
                    {row.note&&<p style={{fontSize:"14px",color:T.ghost,marginTop:"2px",fontStyle:"italic"}}>{row.note}</p>}
                  </div>
                  <p style={{fontSize:"16px",color:row.deposit>0?T.settled:T.ghost,textAlign:"right",fontFamily:"'Playfair Display',Georgia,serif"}}>{row.deposit>0?(revealed?`+${fmt(row.deposit)}`:`+${MASK}`):"—"}</p>
                  <p style={{fontSize:"16px",color:row.refund>0?T.warn:T.ghost,textAlign:"right",fontFamily:"'Playfair Display',Georgia,serif"}}>{row.refund>0?(revealed?`−${fmt(row.refund)}`:`−${MASK}`):"—"}</p>
                  <p style={{fontSize:"17px",color:T.ink,textAlign:"right",fontFamily:"'Playfair Display',Georgia,serif",fontWeight:i===ledger.length-1?500:400}}>{show(row.saldo)}</p>
                </div>
              );
            })}
            <div style={{display:"grid",gridTemplateColumns:"32px 100px 80px 1fr 120px 120px 130px",gap:"0 16px",padding:"16px 0 0",borderTop:`2px solid ${T.lineD}`,marginTop:"4px"}}>
              <span/><span/><span/>
              <p style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted}}>Saldo Kas</p>
              <span/><span/>
              <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"21px",color:T.forest,textAlign:"right",fontWeight:500}}>{ledger.length>0?show(ledger[ledger.length-1].saldo):"—"}</p>
            </div>
          </>
        }
      </div>

      <div style={{borderTop:`1px solid ${T.line}`,paddingTop:"32px"}}>
        <p style={{fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"16px"}}>Catatan</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 40px"}}>
          {["Dana Bersama mencakup Transportasi, Aktivitas (Jeep, Nuvantara) & Merchandise.",
            "F&B seluruhnya disponsori per household — tidak termasuk di sini.",
            "Hotel & tiket Garuda diselesaikan mandiri per household.",
            "HH5 (Mariana, Olive, Nadia) diserap oleh HH2 + HH3 + HH4.",
          ].map((n,i)=><p key={i} style={{fontSize:"15px",color:T.muted,lineHeight:"1.7"}}>— {n}</p>)}
        </div>
        {isCoord&&<p style={{marginTop:"24px",fontSize:"15px"}}><a href="https://docs.google.com/spreadsheets/d/19vHRDue6attrpewZcFNBSq3g3UvxbalaWCog6v5x0d4/edit" target="_blank" rel="noopener noreferrer" style={{color:T.forest,textDecoration:"none",borderBottom:`1px solid ${T.forest}`}}>Buka Google Sheets Lusiana ↗</a></p>}
      </div>
    </div>
  );
});

const TYPE_ICON = {assembly:"◉",train:"◈",arrival:"◉",departure:"◈",transport:"◇",dining:"◆",excursion:"◈",leisure:"◇"};
const TYPE_COLOR = {dining:T.forest,excursion:T.gold,arrival:T.settled,departure:T.settled};

const ItineraryTab = memo(() => {
  const [day,setDay] = useState(1);
  const narrow = useIsNarrow();
  const d = ITINERARY.find(x=>x.day===day);
  return (
    <div className="fade-up">
      <div style={{marginBottom:"56px"}}>
        <p style={{fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"12px"}}>Jadwal Perjalanan</p>
        <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"34px",fontWeight:400,color:T.ink}}>Itinerary v20</h2>
        <p style={{fontSize:"16px",color:T.muted,marginTop:"8px"}}>2–5 Juli 2026 · 23 Peserta · Hyatt Regency Yogyakarta</p>
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${T.line}`,marginBottom:"48px"}}>
        {ITINERARY.map(it=>(
          <button key={it.day} onClick={()=>setDay(it.day)} style={{background:"none",border:"none",padding:"0 32px 16px 0",cursor:"pointer",textAlign:"left"}}>
            <p style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:day===it.day?T.forest:T.ghost,marginBottom:"4px"}}>{`Hari ${it.day}`}</p>
            <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"21px",color:day===it.day?T.forest:T.muted,fontWeight:day===it.day?500:400}}>{it.label}</p>
            {day===it.day&&<div style={{height:"2px",background:T.forest,marginTop:"14px",marginRight:"32px"}}/>}
          </button>
        ))}
      </div>
      {d&&<>
        <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"18px",fontStyle:"italic",color:T.muted,marginBottom:"40px"}}>{d.date}</p>
        <div style={{borderTop:`1px solid ${T.line}`}}>
          {d.events.map((ev,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:narrow?"52px 16px 1fr":"80px 20px 1fr",gap:narrow?"0 14px":"0 24px",borderBottom:`1px solid ${T.line}`,padding:narrow?"22px 0":"28px 0",alignItems:"start"}}>
              <div style={{textAlign:"right",paddingTop:"2px"}}>
                <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"20px",color:T.muted,fontStyle:"italic"}}>{ev.time}</p>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:"6px"}}>
                <span style={{fontSize:"18px",color:TYPE_COLOR[ev.type]||T.ghost,lineHeight:1}}>{TYPE_ICON[ev.type]||"◇"}</span>
                {i<d.events.length-1&&<div style={{flex:1,width:"1px",background:T.line,marginTop:"8px",minHeight:"20px"}}/>}
              </div>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:"16px",flexWrap:"wrap"}}>
                  <h4 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"21px",fontWeight:400,color:T.ink}}>{ev.act}</h4>
                  {ev.sponsor&&<span style={{fontSize:"13px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.gold,whiteSpace:"nowrap",marginTop:"4px"}}>♡ {ev.sponsor}</span>}
                </div>
                <p style={{fontSize:"15px",color:T.muted,marginTop:"4px"}}>{ev.loc}</p>
                {ev.note&&<p style={{fontSize:"15px",color:T.muted,marginTop:"6px",fontStyle:"italic"}}>{ev.note}</p>}
                {ev.vehicles&&<div style={{marginTop:"12px",borderTop:`1px solid ${T.line}`}}>
                  {ev.vehicles.map(c=>{
                    const koperColor = c.bagasi.startsWith("Tanpa")?T.muted:T.gold;
                    return narrow ? (
                      <div key={c.mobil} style={{padding:"12px 0",borderBottom:`1px solid ${T.line}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:"12px",marginBottom:"5px"}}>
                          <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"18px",color:T.forest}}>{c.mobil}</span>
                          <span style={{fontSize:"12px",letterSpacing:"1px",textTransform:"uppercase",color:koperColor,whiteSpace:"nowrap"}}>{c.bagasi}</span>
                        </div>
                        <p style={{fontSize:"16px",color:T.ink,lineHeight:1.55,margin:0}}>{c.pax}</p>
                      </div>
                    ) : (
                      <div key={c.mobil} style={{display:"grid",gridTemplateColumns:"60px 1fr auto",gap:"12px",alignItems:"baseline",padding:"9px 0",borderBottom:`1px solid ${T.line}`}}>
                        <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"17px",color:T.forest}}>{c.mobil}</span>
                        <span style={{fontSize:"16px",color:T.ink,lineHeight:1.45}}>{c.pax}</span>
                        <span style={{fontSize:"12px",letterSpacing:"1px",textTransform:"uppercase",color:koperColor,whiteSpace:"nowrap"}}>{c.bagasi}</span>
                      </div>
                    );
                  })}
                </div>}
              </div>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
});

// ─── OLEH-OLEH SUMMARY ───────────────────────────────────────────────────────
const TRANSFER_INFO = {
  name:"Christine Tambunan",
  bank:"Bank Jago",
  account:"102816180854",
};
const compressImage = (file, maxDim=1600, quality=0.8) => new Promise((resolve,reject)=>{
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      let {width,height} = img;
      if(width>=height && width>maxDim){ height=Math.round(height*maxDim/width); width=maxDim; }
      else if(height>width && height>maxDim){ width=Math.round(width*maxDim/height); height=maxDim; }
      const c = document.createElement("canvas");
      c.width=width; c.height=height;
      c.getContext("2d").drawImage(img,0,0,width,height);
      try { resolve(c.toDataURL("image/jpeg",quality).split(",")[1]); } catch(err){ reject(err); }
    };
    img.onerror = reject;
    img.src = reader.result;
  };
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

// ═══════════════════════════════════════════════════════════════════════════
// PRE-ORDER F&B — Pesan Makanan & Oleh-Oleh (dua tab terpisah)
// ═══════════════════════════════════════════════════════════════════════════
const FB_DEADLINE = new Date("2026-06-25T23:59:59+07:00");
const FB_DEADLINE_LABEL = "25 Juni 2026, 23:59 WIB";
const FOOD_ORDER = ["solaria","kemangi","mbah-mo","ayom","desa-palagan","djiwana","summer-palace"];

const DeadlineCountdown = memo(({target, label, openText="Pre-order ditutup dalam", closedText="Pre-order telah ditutup"}) => {
  const [now,setNow] = useState(Date.now());
  useEffect(()=>{ const id=setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(id); },[]);
  const diff = target.getTime() - now;
  if(diff<=0) return (
    <div style={{background:T.dangerBg,border:"1px solid #e8b4a8",borderLeft:`3px solid ${T.danger}`,padding:"18px 22px",marginBottom:"40px",display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
      <span style={{width:"8px",height:"8px",borderRadius:"50%",background:T.danger,display:"inline-block"}}/>
      <p style={{fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",color:T.danger,fontWeight:500,margin:0}}>{closedText}</p>
      <span style={{fontSize:"14px",color:T.muted}}>Deadline {label} terlewati</span>
    </div>
  );
  const d=Math.floor(diff/86400000), h=Math.floor((diff%86400000)/3600000), m=Math.floor((diff%3600000)/60000), s=Math.floor((diff%60000)/1000);
  const urgent = diff < 86400000;
  const accent = urgent ? T.danger : T.forest;
  const units = [{n:d,l:"Hari"},{n:h,l:"Jam"},{n:m,l:"Menit"},{n:s,l:"Detik"}];
  return (
    <div style={{background:T.cream,border:`1px solid ${urgent?"#e8b4a8":T.line}`,borderLeft:`3px solid ${accent}`,padding:"20px 24px",marginBottom:"40px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"18px"}}>
        <div>
          <p style={{fontSize:"12px",letterSpacing:"3px",textTransform:"uppercase",color:urgent?T.danger:T.muted,marginBottom:"4px",fontWeight:urgent?500:400}}>{urgent?"Segera ditutup":openText}</p>
          <p style={{fontSize:"13px",color:T.muted}}>Deadline {label}</p>
        </div>
        <div style={{display:"flex",gap:"18px"}}>
          {units.map((u,i)=>(
            <div key={u.l} style={{display:"flex",alignItems:"flex-start",gap:"18px"}}>
              <div style={{textAlign:"center",minWidth:"42px"}}>
                <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"30px",fontWeight:500,color:accent,lineHeight:1}}>{String(u.n).padStart(2,"0")}</p>
                <p style={{fontSize:"12px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.muted,marginTop:"6px"}}>{u.l}</p>
              </div>
              {i<units.length-1&&<span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"26px",color:T.ghost,lineHeight:1.1}}>:</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// ─── TAB: PESAN MAKANAN (disponsori, diurut waktu makan) ─────────────────────
const MakanTab = memo(({user}) => {
  const [activeResto,setActiveResto] = useState(null);
  const isCoord = COORDINATORS.includes(user);
  if(activeResto) return <RestaurantView resto={activeResto} user={user} isCoord={isCoord} onBack={()=>setActiveResto(null)}/>;

  const buffetIds = SET_MENUS.map(s=>s.id);
  const items = FOOD_ORDER.map(id => RESTAURANTS.find(r=>r&&r.id===id) || SET_MENUS.find(s=>s&&s.id===id)).filter(Boolean);

  return (
    <div className="fade-up">
      <div style={{marginBottom:"32px"}}>
        <p style={{fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"12px"}}>Pre-Order F&B</p>
        <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"34px",fontWeight:400,color:T.ink}}>Pesan Makanan</h2>
        <p style={{fontSize:"16px",color:T.muted,marginTop:"8px"}}>Seluruh hidangan disponsori per household. Diurut sesuai waktu makan. Pilih restoran untuk melihat menu & memesan; hidangan buffet sudah ditentukan dan tidak perlu dipesan.</p>
      </div>

      <DeadlineCountdown target={FB_DEADLINE} label={FB_DEADLINE_LABEL}/>

      <div style={{borderTop:`1px solid ${T.line}`}}>
        {items.map(m=>{
          const buffet = buffetIds.includes(m.id);
          if(buffet) return (
            <div key={m.id} style={{borderBottom:`1px solid ${T.line}`,padding:"28px 0"}}>
              <div style={{display:"flex",alignItems:"center",gap:"14px",flexWrap:"wrap",marginBottom:"6px"}}>
                <h3 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"21px",fontWeight:400,color:T.ink}}>{m.name}</h3>
                <span style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:T.gold,border:`1px solid ${T.goldL}`,padding:"2px 8px"}}>Buffet · tanpa pesan</span>
                {m.sponsor&&<span style={{fontSize:"13px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.gold}}>♡ {m.sponsor}</span>}
              </div>
              <p style={{fontSize:"15px",color:T.muted}}>{m.subtitle}</p>
              <p style={{fontSize:"15px",color:T.muted,fontStyle:"italic",marginTop:"2px"}}>{m.note}</p>
              <div style={{marginTop:"14px"}}>
                {m.sections.map(sec=>(
                  <div key={sec.label} style={{marginBottom:"10px"}}>
                    <p style={{fontSize:"12px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"4px"}}>{sec.label}</p>
                    <p style={{fontSize:"15px",color:T.mid,lineHeight:1.7}}>{sec.items.join(" · ")}</p>
                  </div>
                ))}
              </div>
            </div>
          );
          return (
            <div key={m.id} onClick={()=>setActiveResto(m)}
              style={{display:"grid",gridTemplateColumns:"1fr auto",alignItems:"center",gap:"24px",borderBottom:`1px solid ${T.line}`,padding:"28px 0",cursor:"pointer"}}
              onMouseEnter={e=>e.currentTarget.style.background=T.cream}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:"16px",flexWrap:"wrap",marginBottom:"6px"}}>
                  <h3 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"21px",fontWeight:400,color:T.ink}}>{m.name}</h3>
                  <span style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:T.settled,borderBottom:`1px solid ${T.settled}`}}>Terbuka</span>
                  {m.sponsor&&<span style={{fontSize:"13px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.gold}}>♡ {m.sponsor}</span>}
                </div>
                <p style={{fontSize:"15px",color:T.muted}}>{m.subtitle}</p>
                {m.note&&<p style={{fontSize:"15px",color:T.muted,fontStyle:"italic",marginTop:"2px"}}>{m.note}</p>}
              </div>
              <span style={{fontSize:"21px",color:T.muted}}>→</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

// ─── TAB: OLEH-OLEH (bayar sendiri) ──────────────────────────────────────────
const OlehOlehTab = memo(({user}) => {
  const isCoord = COORDINATORS.includes(user);
  const takeawayRestos = RESTAURANTS.filter(r=>r.isTakeaway);
  const [activeResto,setActiveResto] = useState(null);
  const [myOrders,setMyOrders]   = useState({});
  const [allPaxOrders,setAllPaxOrders] = useState({});
  const [loading,setLoading]     = useState(true);
  const [myProof,setMyProof]     = useState(null);
  const [allProofs,setAllProofs] = useState({});
  const [uploading,setUploading] = useState(false);
  const [uploadMsg,setUploadMsg] = useState(null);
  const [viewProof,setViewProof] = useState(null);

  const reload = useCallback(async ()=>{
    const mine={};
    for(const r of takeawayRestos){
      const key=`order.${r.id}.${user.replace(/\s+/g,"_")}`;
      try{ const v=await sGet(key); if(v){ const p=JSON.parse(v); if(p.totalIDR>0) mine[r.id]={name:r.name,totalIDR:p.totalIDR,items:p.items||[]}; } }catch{}
    }
    setMyOrders(mine);
    try{ const pv=await sGet(`oleholeh.proof.${user.replace(/\s+/g,"_")}`); if(pv) setMyProof(JSON.parse(pv)); }catch{}
    if(isCoord){
      const all={};
      for(const r of takeawayRestos){
        try{
          const keys=await sList(`order.${r.id}.`);
          for(const k of keys){ const v=await sGet(k); if(v){ const p=JSON.parse(v); const pName=k.replace(`order.${r.id}.`,"").replace(/_/g," "); if(!all[pName]) all[pName]={}; if(p.totalIDR>0) all[pName][r.id]={name:r.name,totalIDR:p.totalIDR,items:p.items||[]}; } }
        }catch{}
      }
      setAllPaxOrders(all);
      try{ const pkeys=await sList("oleholeh.proof."); const proofs={}; for(const k of pkeys){ const v=await sGet(k); if(v){ proofs[k.replace("oleholeh.proof.","").replace(/_/g," ")]=JSON.parse(v); } } setAllProofs(proofs); }catch{}
    }
    setLoading(false);
  },[user,isCoord]);

  useEffect(()=>{ reload(); },[reload]);

  const onFile = async e => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if(!file) return;
    setUploading(true); setUploadMsg(null);
    try {
      const dataBase64 = await compressImage(file, 1200, 0.72);
      const now = new Date();
      const pad = n=>String(n).padStart(2,"0");
      const stamp = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}${pad(now.getMinutes())}`;
      const filename = `TransferOlehOleh ${user} ${stamp}.jpg`;
      const key = user.replace(/\s+/g,"_");
      await sSet(`oleholeh.proofimg.${key}`, dataBase64);
      const rec = {ts:now.toISOString(), filename};
      await sSet(`oleholeh.proof.${key}`, JSON.stringify(rec));
      setMyProof(rec);
      setUploadMsg("✓ Bukti tersimpan. Terima kasih!");
    } catch { setUploadMsg("Gagal menyimpan. Periksa koneksi & coba lagi."); }
    setUploading(false);
  };

  const openProof = async (pName) => {
    const fn = allProofs[pName]?.filename || `TransferOlehOleh ${pName}.jpg`;
    setViewProof({name:pName, dataUrl:null, filename:fn, error:null});
    try {
      const b64 = await sGet(`oleholeh.proofimg.${pName.replace(/\s+/g,"_")}`);
      if(b64) setViewProof(v=>v&&v.name===pName?{...v,dataUrl:`data:image/jpeg;base64,${b64}`}:v);
      else setViewProof(v=>v&&v.name===pName?{...v,error:"Gambar tidak ditemukan."}:v);
    } catch { setViewProof(v=>v&&v.name===pName?{...v,error:"Gagal memuat gambar."}:v); }
  };

  if(activeResto) return <RestaurantView resto={activeResto} user={user} isCoord={isCoord} onBack={()=>{setActiveResto(null);reload();}}/>;

  const myStores  = Object.values(myOrders);
  const myTotal   = myStores.reduce((s,o)=>s+Number(o.totalIDR),0);
  const paxWithOrders = Object.entries(allPaxOrders).filter(([,stores])=>Object.keys(stores).length>0);
  const proofCount = paxWithOrders.filter(([pName])=>allProofs[pName]).length;
  const merchantAgg = takeawayRestos.map(r=>{
    const tally={}; let subtotal=0;
    paxWithOrders.forEach(([,stores])=>{ const o=stores[r.id]; if(o){ subtotal+=Number(o.totalIDR||0); (o.items||[]).forEach(i=>{ const k=i.config?`${i.name} [${i.config}]`:i.name; tally[k]=(tally[k]||0)+Number(i.qty); }); } });
    return {id:r.id,name:r.name,subtotal,items:Object.entries(tally).sort((a,b)=>b[1]-a[1])};
  }).filter(mm=>mm.items.length>0);

  return (
    <div className="fade-up">
      <div style={{marginBottom:"32px"}}>
        <p style={{fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"12px"}}>Pre-Order F&B</p>
        <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"34px",fontWeight:400,color:T.ink}}>Oleh-Oleh</h2>
        <p style={{fontSize:"16px",color:T.muted,marginTop:"8px"}}>Dibayar sendiri. Pilih merchant untuk memesan, lalu transfer ke koordinator dan unggah bukti di bawah.</p>
      </div>

      <DeadlineCountdown target={FB_DEADLINE} label={FB_DEADLINE_LABEL}/>

      {/* ── MERCHANT CARDS ── */}
      <div style={{marginBottom:"48px",borderTop:`1px solid ${T.line}`}}>
        {takeawayRestos.map(r=>(
          <div key={r.id} onClick={()=>setActiveResto(r)}
            style={{display:"grid",gridTemplateColumns:"1fr auto",alignItems:"center",gap:"24px",borderBottom:`1px solid ${T.line}`,padding:"28px 0",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.background=T.cream}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:"16px",flexWrap:"wrap",marginBottom:"6px"}}>
                <h3 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"21px",fontWeight:400,color:T.ink}}>{r.name}</h3>
                <span style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:T.gold,borderBottom:`1px solid ${T.gold}`}}>Terbuka</span>
              </div>
              <p style={{fontSize:"15px",color:T.muted}}>{r.subtitle}</p>
              {myOrders[r.id]&&<p style={{fontSize:"14px",color:T.settled,marginTop:"4px"}}>✓ Anda sudah memesan · IDR {Number(myOrders[r.id].totalIDR).toLocaleString("id-ID")}</p>}
            </div>
            <span style={{fontSize:"21px",color:T.muted}}>→</span>
          </div>
        ))}
      </div>

      {/* ── PAYMENT CARD ── */}
      {myStores.length>0&&(
        <div style={{border:`1px solid ${T.gold}`,marginBottom:"48px"}}>
          <div style={{background:T.gold,padding:"14px 24px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{fontSize:"13px",letterSpacing:"3px",textTransform:"uppercase",color:"white",fontWeight:500}}>Tagihan Oleh-Oleh · Bayar Langsung 5 Juli 2026</p>
            <p style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.8)"}}>Satu Transfer</p>
          </div>
          <div style={{background:T.cream,padding:"24px"}}>
            {myStores.map(o=>(
              <div key={o.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${T.line}`}}>
                <span style={{fontSize:"17px",color:T.ink}}>{o.name}</span>
                <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"19px",color:T.settled}}>IDR {Number(o.totalIDR).toLocaleString("id-ID")}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0 0"}}>
              <span style={{fontSize:"15px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted}}>Total Transfer</span>
              <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"24px",color:T.forest,fontWeight:500}}>IDR {myTotal.toLocaleString("id-ID")}</span>
            </div>
            <div style={{marginTop:"20px",padding:"16px",background:T.stone,borderLeft:`3px solid ${T.gold}`}}>
              <p style={{fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"8px"}}>Transfer ke</p>
              <p style={{fontSize:"18px",color:T.ink,fontWeight:500,marginBottom:"2px"}}>{TRANSFER_INFO.name}</p>
              <p style={{fontSize:"17px",color:T.mid}}>{TRANSFER_INFO.bank} · {TRANSFER_INFO.account}</p>
              <p style={{fontSize:"15px",color:T.muted,marginTop:"8px"}}>Berita: <span style={{color:T.ink,fontWeight:500}}>OLEHOLEH {user}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* ── COORDINATOR: REKAP PER PESERTA (dengan total) ── */}
      {isCoord&&paxWithOrders.length>0&&(
        <div style={{marginBottom:"48px"}}>
          <p style={{fontSize:"13px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"24px"}}>Rekap Per Peserta</p>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:"15px"}}>
              <thead>
                <tr style={{borderBottom:`2px solid ${T.line}`}}>
                  <th style={{textAlign:"left",padding:"8px 12px 8px 0",color:T.muted,fontWeight:400,letterSpacing:"1px",textTransform:"uppercase",fontSize:"13px"}}>Peserta</th>
                  {takeawayRestos.map(r=><th key={r.id} style={{textAlign:"right",padding:"8px 12px",color:T.muted,fontWeight:400,letterSpacing:"1px",textTransform:"uppercase",fontSize:"13px",whiteSpace:"nowrap"}}>{r.name}</th>)}
                  <th style={{textAlign:"right",padding:"8px 0 8px 12px",color:T.forest,fontWeight:500,letterSpacing:"1px",textTransform:"uppercase",fontSize:"13px"}}>Total</th>
                </tr>
              </thead>
              <tbody>
                {paxWithOrders.sort((a,b)=>a[0].localeCompare(b[0])).map(([pName,stores])=>{
                  const rowTotal = Object.values(stores).reduce((s,o)=>s+Number(o.totalIDR),0);
                  return (
                    <tr key={pName} style={{borderBottom:`1px solid ${T.line}`}}>
                      <td style={{padding:"10px 12px 10px 0",color:T.ink}}>{pName}</td>
                      {takeawayRestos.map(r=>(
                        <td key={r.id} style={{textAlign:"right",padding:"10px 12px",color:stores[r.id]?T.settled:T.ghost,fontFamily:"'Playfair Display',Georgia,serif"}}>
                          {stores[r.id]?`IDR ${Number(stores[r.id].totalIDR).toLocaleString("id-ID")}`:"—"}
                        </td>
                      ))}
                      <td style={{textAlign:"right",padding:"10px 0 10px 12px",color:T.forest,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:500}}>IDR {rowTotal.toLocaleString("id-ID")}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{borderTop:`2px solid ${T.lineD}`}}>
                  <td style={{padding:"12px 12px 4px 0",fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted}}>Total</td>
                  {takeawayRestos.map(r=>{
                    const storeTotal = paxWithOrders.reduce((s,[,stores])=>s+Number(stores[r.id]?.totalIDR||0),0);
                    return <td key={r.id} style={{textAlign:"right",padding:"12px 12px 4px",color:T.forest,fontFamily:"'Playfair Display',Georgia,serif",fontWeight:500}}>{storeTotal>0?`IDR ${storeTotal.toLocaleString("id-ID")}`:"—"}</td>;
                  })}
                  <td style={{textAlign:"right",padding:"12px 0 4px 12px",fontFamily:"'Playfair Display',Georgia,serif",fontSize:"20px",color:T.forest,fontWeight:500}}>
                    IDR {paxWithOrders.reduce((s,[,stores])=>s+Object.values(stores).reduce((ss,o)=>ss+Number(o.totalIDR),0),0).toLocaleString("id-ID")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── COORDINATOR: REKAP TOTAL PER MERCHANT (tanpa nama) ── */}
      {isCoord&&merchantAgg.length>0&&(
        <div style={{marginBottom:"48px"}}>
          <p style={{fontSize:"13px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"6px"}}>Rekap Pesanan Per Merchant</p>
          <p style={{fontSize:"14px",color:T.muted,marginBottom:"24px",fontStyle:"italic"}}>Gabungan seluruh peserta, tanpa nama — referensi koordinator memesan langsung ke toko.</p>
          {merchantAgg.map(mm=>(
            <div key={mm.id} style={{border:`1px solid ${T.line}`,marginBottom:"16px"}}>
              <div style={{background:T.cream,padding:"12px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"19px",color:T.ink}}>{mm.name}</span>
                <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"19px",color:T.forest,fontWeight:500}}>IDR {mm.subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div style={{padding:"6px 20px 16px"}}>
                {mm.items.map(([n,q])=>(
                  <div key={n} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.line}`}}>
                    <span style={{fontSize:"16px",color:T.ink}}>{n}</span>
                    <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"19px",color:T.forest,whiteSpace:"nowrap"}}>{q}×</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── BUKTI TRANSFER (paling bawah) ── */}
      {(myStores.length>0 || (isCoord&&paxWithOrders.length>0))&&(
        <div style={{marginBottom:"56px"}}>
          <p style={{fontSize:"13px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"24px"}}>Bukti Transfer</p>

          {myStores.length>0&&(
            <div style={{marginBottom:isCoord&&paxWithOrders.length>0?"32px":"0"}}>
              {myProof
                ? <div style={{background:T.settledBg,border:`1px solid ${T.settled}`,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
                    <p style={{fontSize:"14px",color:T.settled}}>✓ Bukti tersimpan · {new Date(myProof.ts).toLocaleString("id-ID",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</p>
                    <label style={{fontSize:"12px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.muted,cursor:uploading?"wait":"pointer",borderBottom:`1px solid ${T.lineD}`}}>{uploading?"Mengunggah…":"Ganti bukti"}<input type="file" accept="image/*" onChange={onFile} disabled={uploading} style={{display:"none"}}/></label>
                  </div>
                : <label style={{display:"block",textAlign:"center",border:`1px dashed ${T.gold}`,padding:"14px",cursor:uploading?"wait":"pointer",fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:uploading?T.muted:T.forest,background:"white"}}>{uploading?"Mengunggah…":"Upload Bukti Transfer"}<input type="file" accept="image/*" onChange={onFile} disabled={uploading} style={{display:"none"}}/></label>}
              {uploadMsg&&<p style={{fontSize:"13px",color:uploadMsg.startsWith("✓")?T.settled:T.danger,marginTop:"8px"}}>{uploadMsg}</p>}
            </div>
          )}

          {isCoord&&paxWithOrders.length>0&&(
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"15px"}}>
                <thead>
                  <tr style={{borderBottom:`2px solid ${T.line}`}}>
                    <th style={{textAlign:"left",padding:"8px 12px 8px 0",color:T.muted,fontWeight:400,letterSpacing:"1px",textTransform:"uppercase",fontSize:"13px"}}>Peserta</th>
                    <th style={{textAlign:"left",padding:"8px 0 8px 12px",color:T.muted,fontWeight:400,letterSpacing:"1px",textTransform:"uppercase",fontSize:"13px"}}>Bukti</th>
                  </tr>
                </thead>
                <tbody>
                  {paxWithOrders.sort((a,b)=>a[0].localeCompare(b[0])).map(([pName])=>(
                    <tr key={pName} style={{borderBottom:`1px solid ${T.line}`}}>
                      <td style={{padding:"12px 12px 12px 0",color:T.ink}}>{pName}</td>
                      <td style={{padding:"12px 0 12px 12px"}}>
                        {allProofs[pName]
                          ? <button onClick={()=>openProof(pName)} style={{background:"none",border:"none",cursor:"pointer",color:T.settled,fontSize:"14px",fontFamily:"inherit",textDecoration:"underline",padding:0}}>✓ {new Date(allProofs[pName].ts).toLocaleDateString("id-ID",{day:"numeric",month:"short"})} · Lihat / Unduh</button>
                          : <span style={{fontSize:"14px",color:T.ghost}}>Belum upload</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{fontSize:"14px",color:T.muted,marginTop:"16px"}}>{proofCount}/{paxWithOrders.length} bukti terkumpul</p>
            </div>
          )}
        </div>
      )}

      {/* ── PROOF VIEWER MODAL ── */}
      {viewProof&&(
        <div onClick={()=>setViewProof(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:"white",maxWidth:"520px",width:"100%",maxHeight:"92vh",overflowY:"auto",padding:"20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"14px",gap:"12px"}}>
              <p style={{fontSize:"15px",color:T.ink,fontWeight:500}}>Bukti Transfer · {viewProof.name}</p>
              <button onClick={()=>setViewProof(null)} style={{background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:"13px",letterSpacing:"1.5px",textTransform:"uppercase"}}>Tutup ✕</button>
            </div>
            {viewProof.error
              ? <p style={{fontSize:"15px",color:T.danger,padding:"24px 0",textAlign:"center"}}>{viewProof.error}</p>
              : viewProof.dataUrl
                ? <>
                    <img src={viewProof.dataUrl} alt="Bukti transfer" style={{width:"100%",height:"auto",border:`1px solid ${T.line}`,display:"block"}}/>
                    <a href={viewProof.dataUrl} download={viewProof.filename} style={{display:"block",textAlign:"center",marginTop:"14px",background:T.forest,color:"white",padding:"12px",textDecoration:"none",fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase"}}>Unduh</a>
                  </>
                : <p style={{fontSize:"15px",color:T.muted,padding:"24px 0",textAlign:"center"}}>Memuat gambar…</p>}
          </div>
        </div>
      )}
    </div>
  );
});

// ─── PATCH 3: DISABLED ITEM RENDERING in RestaurantView ──────────────────────
const RestaurantView = memo(({resto,user,isCoord,onBack}) => {
  const [tab,setTab] = useState("order");
  const [cat,setCat] = useState(resto.categories[0].id);
  const [searchQuery,setSearchQuery] = useState("");
  const [cart,setCart] = useState({});
  const [submitted,setSubmitted] = useState(false);
  const [locked,setLocked] = useState(false);
  const [allOrders,setAllOrders] = useState({});
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [deleting,setDeleting] = useState(false);
  const [deleteConfirm,setDeleteConfirm] = useState(false);
  const [notes,setNotes] = useState({});
  const [itemConfig,setItemConfig] = useState({});
  const [configError,setConfigError] = useState({});
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
          // restore config selections from saved order
          const cfgById = {};
          (grouped[user].items||[]).forEach(it=>{
            const match = resto.categories.flatMap(c=>c.items).find(i=>i.name===it.name);
            if(match && it.config){
              const parts = it.config.split(" · ");
              const cfg = {opts:{}};
              if(match.variants){ const v=match.variants.find(vv=>parts.includes(vv.label)); if(v) cfg.variant=v.label; }
              if(match.options){ match.options.forEach(g=>{ const found=g.choices.find(ch=>parts.includes(ch)); if(found) cfg.opts[g.id]=found; }); }
              cfgById[match.id]=cfg;
            }
          });
          setItemConfig(cfgById);
          setSubmitted(true);
          setTab("recap");
        }
      } catch { setSyncError("Gagal memuat data."); }
      setLoading(false);
    })();
  }, [resto.id, user]);

  useEffect(()=>{ const id=setInterval(refresh,30000); return ()=>clearInterval(id); },[refresh]);

  const setVariant = (id,label) => { setItemConfig(p=>({...p,[id]:{...p[id],variant:label}})); setConfigError(e=>({...e,[id]:false})); };
  const setOpt = (id,gid,val) => { setItemConfig(p=>({...p,[id]:{...p[id],opts:{...p[id]?.opts,[gid]:val}}})); setConfigError(e=>({...e,[id]:false})); };
  const add = item => {
    if(item.disabled) return;
    const cfg = itemConfig[item.id] || {};
    if(item.variants && !cfg.variant){ setConfigError(e=>({...e,[item.id]:true})); return; }
    if(item.options){ for(const g of item.options){ if(g.required && !cfg.opts?.[g.id]){ setConfigError(e=>({...e,[item.id]:true})); return; } } }
    const price = item.variants ? (item.variants.find(v=>v.label===cfg.variant)?.price||null) : (item.price||null);
    const parts = [];
    if(cfg.variant) parts.push(cfg.variant);
    if(item.options) item.options.forEach(g=>{ if(cfg.opts?.[g.id]) parts.push(cfg.opts[g.id]); });
    const config = parts.join(" · ");
    setCart(p=>({...p,[item.id]:{name:item.name,qty:(p[item.id]?.qty||0)+1,notes:p[item.id]?.notes||"",price,config}}));
  };
  const rem = id  => setCart(p=>{ const n={...p}; if(n[id]?.qty>1) n[id]={...n[id],qty:n[id].qty-1}; else delete n[id]; return n; });
  const setNote = (id,v) => setCart(p=>p[id]?{...p,[id]:{...p[id],notes:v}}:p);
  const cartCount = Object.values(cart).reduce((s,i)=>s+i.qty,0);

  const submit = useCallback(async () => {
    if(!cartCount||saving) return;
    setSaving(true); setSyncError(null);
    try {
      const items = Object.values(cart).map(i=>({name:i.name,qty:i.qty,notes:i.notes||"",price:i.price||0,config:i.config||""}));
      const nettIDR  = items.reduce((s,i)=>s+(i.price||0)*i.qty,0);
      const totalIDR = resto.taxRate ? Math.round(nettIDR*(1+resto.taxRate)) : nettIDR;
      const key = `order.${resto.id}.${user.replace(/\s+/g,"_")}`;
      const ok = await sSet(key, JSON.stringify({peserta:user,hh:ALL_PAX.find(p=>p.name===user)?.hh||"",items,totalIDR,submittedAt:new Date().toISOString()}));
      if(ok){ setSubmitted(true); await refresh(); setTab("recap"); }
      else setSyncError("Gagal menyimpan order. Coba lagi.");
    } catch { setSyncError("Gagal menyimpan order. Coba lagi."); }
    setSaving(false);
  },[cart,cartCount,resto.id,user,refresh,saving]);

  const deleteOrder = useCallback(async () => {
    setDeleting(true);
    try {
      const key = `order.${resto.id}.${user.replace(/\s+/g,"_")}`;
      await sSet(key, "");
      setCart({});
      setNotes({});
      setItemConfig({});
      setSubmitted(false);
      setDeleteConfirm(false);
      await refresh();
    } catch { }
    setDeleting(false);
  },[resto.id,user,refresh]);

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
      <p style={{fontSize:"16px",letterSpacing:"2px",textTransform:"uppercase"}}>Memuat data dari Firebase…</p>
    </div>
  );

  return (
    <div className="fade-up">
      <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,padding:"0 0 32px",display:"flex",alignItems:"center",gap:"8px"}}>← Kembali</button>

      <div style={{marginBottom:"48px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"16px",marginBottom:"8px"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"6px"}}>
              <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"32px",fontWeight:400,color:T.ink}}>{resto.name}</h2>
              <span style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",padding:"3px 8px",border:`1px solid ${locked?"#c88":T.settled}`,color:locked?T.danger:T.settled}}>{locked?"Ditutup":"Terbuka"}</span>
            </div>
            <p style={{fontSize:"15px",color:T.muted}}>{resto.subtitle} · {resto.note}</p>
            {resto.deadline&&<p style={{fontSize:"14px",color:T.warn,marginTop:"4px",letterSpacing:"0.5px"}}>Deadline pre-order: {resto.deadline}</p>}
            {resto.taxRate&&<p style={{fontSize:"14px",color:T.muted,marginTop:"4px"}}>Harga nett · +11% pajak pemerintah & +10% service charge ditambahkan saat checkout</p>}
            {lastSync&&<p style={{fontSize:"14px",color:T.ghost,marginTop:"4px"}}>Tersimpan: {lastSync.toLocaleTimeString("id-ID")} · Auto-refresh 30 dtk</p>}
          </div>
          <div style={{display:"flex",gap:"12px",alignItems:"center",flexWrap:"wrap"}}>
            {isCoord&&<button onClick={toggleLock} style={{background:"none",border:`1px solid ${T.lineD}`,padding:"8px 18px",cursor:"pointer",fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",color:locked?T.settled:T.danger}}>{locked?"Buka Order":"Kunci Order"}</button>}
            {isCoord&&<button onClick={exportCSV} style={{background:T.forest,border:"none",padding:"8px 18px",cursor:"pointer",fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",color:"white"}}>Export CSV</button>}
            <button onClick={refresh} style={{background:"none",border:`1px solid ${T.line}`,padding:"8px 18px",cursor:"pointer",fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted}}>↻ Refresh</button>
          </div>
        </div>
        {syncError&&<div style={{background:T.dangerBg,border:"1px solid #e8b4a8",padding:"10px 16px",marginTop:"8px"}}><p style={{fontSize:"15px",color:T.danger}}>{syncError}</p></div>}
      </div>

      <div style={{display:"flex",borderBottom:`1px solid ${T.line}`,marginBottom:"40px"}}>
        {[{id:"order",label:"Order Saya"},{id:"recap",label:`Rekap Semua — ${ordered}/${total}`}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",padding:"0 32px 16px 0",cursor:"pointer",fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",fontWeight:tab===t.id?500:300,color:tab===t.id?T.forest:T.muted,borderBottom:tab===t.id?`2px solid ${T.forest}`:"2px solid transparent",marginBottom:"-1px",transition:"all 0.2s"}}>{t.label}</button>
        ))}
      </div>

      {tab==="order"&&<div>
        {locked&&!isCoord&&<div style={{background:T.dangerBg,border:"1px solid #e8b4a8",padding:"16px 20px",marginBottom:"24px"}}><p style={{fontSize:"15px",color:T.danger}}>Pre-order telah ditutup. Hubungi koordinator untuk perubahan.</p></div>}
        {submitted&&!deleteConfirm&&(
          <div style={{background:T.settledBg,border:`1px solid ${T.settled}`,padding:"14px 20px",marginBottom:"24px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <p style={{fontSize:"15px",color:T.settled}}>✓ Order Anda sudah terkirim.</p>
              {!locked&&<div style={{display:"flex",gap:"10px"}}>
                <button onClick={()=>{setSubmitted(false);setTab("order");}} style={{background:"none",border:`1px solid ${T.settled}`,padding:"5px 14px",cursor:"pointer",fontSize:"14px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.settled}}>Edit</button>
                <button onClick={()=>setDeleteConfirm(true)} style={{background:"none",border:`1px solid ${T.danger}`,padding:"5px 14px",cursor:"pointer",fontSize:"14px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.danger}}>× Batalkan</button>
              </div>}
            </div>
          </div>
        )}
        {deleteConfirm&&(
          <div style={{background:T.dangerBg,border:`1px solid ${T.danger}`,padding:"18px 20px",marginBottom:"24px"}}>
            <p style={{fontSize:"17px",color:T.danger,fontWeight:500,marginBottom:"4px"}}>Hapus seluruh pesanan ini?</p>
            <p style={{fontSize:"15px",color:T.muted,marginBottom:"16px"}}>Tindakan ini tidak dapat dibatalkan.</p>
            <div style={{display:"flex",gap:"10px"}}>
              <button onClick={()=>setDeleteConfirm(false)} style={{background:"none",border:`1px solid ${T.lineD}`,padding:"8px 20px",cursor:"pointer",fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",color:T.mid}}>Tidak</button>
              <button onClick={deleteOrder} disabled={deleting} style={{background:T.danger,border:"none",padding:"8px 20px",cursor:"pointer",fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",color:"white",fontWeight:500}}>
                {deleting?"Menghapus…":"Ya, Hapus"}
              </button>
            </div>
          </div>
        )}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"28px",paddingBottom:"16px",borderBottom:`1px solid ${T.line}`}}>
          <p style={{fontSize:"15px",color:T.muted}}>Pemesanan sebagai <span style={{color:T.ink,fontWeight:500}}>{user}</span></p>
          {cartCount>0&&<span style={{fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",color:T.forest,fontWeight:500}}>{cartCount} item dipilih</span>}
        </div>

        {/* ── Search bar ── */}
        <div style={{position:"relative",marginBottom:"24px"}}>
          <span style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",fontSize:"18px",color:T.muted,pointerEvents:"none"}}>⌕</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e=>setSearchQuery(e.target.value)}
            placeholder="Cari menu…"
            style={{width:"100%",padding:"10px 36px 10px 38px",border:`1px solid ${searchQuery?T.forest:T.lineD}`,background:searchQuery?T.cream:"transparent",fontSize:"17px",color:T.ink,outline:"none",fontFamily:"'Jost',sans-serif",fontWeight:300,letterSpacing:"0.3px",transition:"all 0.2s",boxSizing:"border-box"}}
          />
          {searchQuery&&(
            <button onClick={()=>setSearchQuery("")} style={{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:"20px",color:T.muted,lineHeight:1,padding:"2px 4px"}}>×</button>
          )}
        </div>

        {/* ── Category tabs — hidden during search ── */}
        {!searchQuery&&(
          <div style={{display:"flex",flexWrap:"wrap",borderBottom:`1px solid ${T.line}`,marginBottom:"32px"}}>
            {resto.categories.map(c=>(
              <button key={c.id} onClick={()=>setCat(c.id)} style={{background:"none",border:"none",padding:"10px 20px 10px 0",cursor:"pointer",fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",color:cat===c.id?T.ink:T.muted,fontWeight:cat===c.id?500:300,borderBottom:cat===c.id?`2px solid ${T.ink}`:"2px solid transparent",marginBottom:"-1px",transition:"all 0.2s"}}>{c.name}</button>
            ))}
          </div>
        )}

        {/* ── Item list: filtered by search OR by active category ── */}
        {(()=>{
          const q = searchQuery.toLowerCase().trim();
          const renderItem = (item, catLabel) => {
            const inCart=cart[item.id];
            const isDisabled = item.disabled === true;
            const cfg = itemConfig[item.id] || {};
            const hasVariants = Array.isArray(item.variants);
            const selVariant = hasVariants ? item.variants.find(v=>v.label===cfg.variant) : null;
            const displayPrice = hasVariants ? (selVariant?selVariant.price:null) : item.price;
            const hasPrice = displayPrice != null && !isDisabled;
            const priceRange = hasVariants ? `IDR ${Math.min(...item.variants.map(v=>v.price)).toLocaleString("id-ID")}–${Math.max(...item.variants.map(v=>v.price)).toLocaleString("id-ID")}` : null;
            return (
              <div key={item.id} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"24px",alignItems:"start",borderBottom:`1px solid ${T.line}`,padding:"20px",margin:"0 -20px",background:isDisabled?T.stone:inCart?T.cream:"transparent",opacity:isDisabled?0.45:1,transition:"background 0.2s"}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"2px",flexWrap:"wrap"}}>
                    <p style={{fontSize:"18px",color:isDisabled?T.muted:T.ink,fontWeight:inCart?500:300,margin:0}}>{item.name}</p>
                    {hasPrice&&resto.id!=="solaria"&&<span style={{fontSize:"14px",letterSpacing:"1px",color:T.gold,border:`1px solid ${T.goldL}`,padding:"1px 7px",fontWeight:500,whiteSpace:"nowrap"}}>IDR {displayPrice.toLocaleString("id-ID")}</span>}
                    {!hasPrice&&priceRange&&!isDisabled&&<span style={{fontSize:"14px",letterSpacing:"1px",color:T.muted,border:`1px solid ${T.line}`,padding:"1px 7px",whiteSpace:"nowrap"}}>{priceRange}</span>}
                    {q&&catLabel&&<span style={{fontSize:"13px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.ghost,border:`1px solid ${T.line}`,padding:"1px 6px"}}>{catLabel}</span>}
                  </div>
                  {isDisabled&&<p style={{fontSize:"14px",color:T.ghost,letterSpacing:"1px",textTransform:"uppercase",marginBottom:"2px"}}>{item.price&&item.price>=200?`Tidak tersedia — IDR ${item.price}k melebihi batas IDR 200k`:"Harga pasar — hubungi koordinator"}</p>}
                  {item.desc&&<p style={{fontSize:"15px",color:isDisabled?T.ghost:T.muted,fontStyle:"italic"}}>{item.desc}</p>}

                  {hasVariants&&!isDisabled&&(
                    <div style={{marginTop:"10px"}}>
                      <p style={{fontSize:"13px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.muted,marginBottom:"6px"}}>Pilihan *</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                        {item.variants.map(v=>(
                          <button key={v.label} onClick={()=>setVariant(item.id,v.label)} style={{background:cfg.variant===v.label?T.forest:"transparent",border:`1px solid ${cfg.variant===v.label?T.forest:T.lineD}`,color:cfg.variant===v.label?"white":T.mid,padding:"5px 12px",cursor:"pointer",fontSize:"15px",letterSpacing:"0.5px",transition:"all 0.15s"}}>{v.label} · {(v.price/1000)}k</button>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.options&&!isDisabled&&item.options.map(g=>(
                    <div key={g.id} style={{marginTop:"10px"}}>
                      <p style={{fontSize:"13px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.muted,marginBottom:"6px"}}>{g.label}{g.required?" *":""}</p>
                      <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                        {g.choices.map(ch=>(
                          <button key={ch} onClick={()=>setOpt(item.id,g.id,ch)} style={{background:cfg.opts?.[g.id]===ch?T.forest:"transparent",border:`1px solid ${cfg.opts?.[g.id]===ch?T.forest:T.lineD}`,color:cfg.opts?.[g.id]===ch?"white":T.mid,padding:"5px 12px",cursor:"pointer",fontSize:"15px",letterSpacing:"0.5px",transition:"all 0.15s"}}>{ch}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {configError[item.id]&&<p style={{fontSize:"14px",color:T.danger,marginTop:"8px",letterSpacing:"0.5px"}}>Pilih dulu opsi bertanda * sebelum menambah.</p>}

                  {inCart&&!isDisabled&&<input value={notes[item.id]||inCart.notes||""} onChange={e=>{setNotes(n=>({...n,[item.id]:e.target.value}));setNote(item.id,e.target.value);}}
                    placeholder="Catatan khusus (opsional)"
                    style={{marginTop:"10px",width:"100%",maxWidth:"360px",padding:"8px 0",border:"none",borderBottom:`1px solid ${T.lineD}`,background:"transparent",fontSize:"16px",color:T.mid,outline:"none"}}/>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"16px",paddingTop:"2px"}}>
                  {inCart&&!isDisabled&&<>
                    <button onClick={()=>rem(item.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:"21px",color:T.muted,lineHeight:1,fontFamily:"serif",padding:"4px 8px"}}>−</button>
                    <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"21px",color:T.ink,minWidth:"24px",textAlign:"center"}}>{inCart.qty}</span>
                  </>}
                  {isDisabled
                    ? <span style={{fontSize:"15px",color:T.ghost,fontStyle:"italic",padding:"4px 10px",minWidth:"32px",textAlign:"center"}}>N/A</span>
                    : <button onClick={()=>add(item)} disabled={locked&&!isCoord} style={{background:"none",border:`1px solid ${locked&&!isCoord?T.ghost:T.ink}`,cursor:locked&&!isCoord?"not-allowed":"pointer",fontSize:"20px",color:locked&&!isCoord?T.ghost:T.ink,fontFamily:"serif",padding:"4px 10px",transition:"all 0.2s"}}>+</button>
                  }
                </div>
              </div>
            );
          };

          if(q) {
            // Search mode: show matching items across all categories
            const results = [];
            resto.categories.forEach(c=>{
              c.items.forEach(item=>{
                if((item.name||"").toLowerCase().includes(q)||(item.desc||"").toLowerCase().includes(q)){
                  results.push({item, catName:c.name});
                }
              });
            });
            if(!results.length) return (
              <div style={{padding:"40px 0",textAlign:"center"}}>
                <p style={{fontSize:"17px",color:T.muted,fontStyle:"italic"}}>Tidak ada menu yang cocok dengan "<strong>{searchQuery}</strong>"</p>
                <button onClick={()=>setSearchQuery("")} style={{marginTop:"12px",background:"none",border:`1px solid ${T.lineD}`,padding:"6px 18px",cursor:"pointer",fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",color:T.mid}}>Hapus Pencarian</button>
              </div>
            );
            return (
              <div>
                <p style={{fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"16px",paddingBottom:"12px",borderBottom:`1px solid ${T.line}`}}>{results.length} hasil untuk "{searchQuery}"</p>
                <div style={{borderTop:`1px solid ${T.line}`}}>
                  {results.map(({item,catName})=>renderItem(item,catName))}
                </div>
              </div>
            );
          }

          // Normal mode: active category only
          return resto.categories.filter(c=>c.id===cat).map(c=>(
            <div key={c.id} style={{borderTop:`1px solid ${T.line}`}}>
              {c.items.map(item=>renderItem(item,null))}
            </div>
          ));
        })()}

        {cartCount>0&&<div style={{marginTop:"40px",padding:"32px",background:T.cream,borderTop:`2px solid ${T.forest}`}}>
          <p style={{fontSize:"13px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"20px"}}>Ringkasan Pesanan</p>
          {(()=>{
            const cartEntries = Object.entries(cart);
            const hasPrices = cartEntries.some(([,item])=>item.price!=null);
            const nettTotal = hasPrices ? cartEntries.reduce((s,[,item])=>s+(item.price||0)*item.qty,0) : 0;
            const taxAmt    = resto.taxRate ? Math.round(nettTotal * resto.taxRate) : 0;
            const grandTotal = nettTotal + taxAmt;
            return <>
              {cartEntries.map(([id,item])=>(
                <div key={id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.line}`,gap:"12px"}}>
                  <span style={{fontSize:"17px",color:T.ink,flex:1}}>{item.name}{item.config&&<span style={{color:T.gold}}> · {item.config}</span>}{item.notes&&<span style={{color:T.muted,fontStyle:"italic"}}> · {item.notes}</span>}</span>
                  <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"19px",color:T.ink,minWidth:"32px",textAlign:"right"}}>×{item.qty}</span>
                  {hasPrices&&item.price&&resto.id!=="solaria"&&<span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"18px",color:T.settled,minWidth:"120px",textAlign:"right"}}>IDR {(item.price*item.qty).toLocaleString("id-ID")}</span>}
                </div>
              ))}
              {hasPrices&&nettTotal>0&&resto.id!=="solaria"&&<>
                {resto.taxRate&&<>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 4px",borderTop:`1px solid ${T.line}`,marginTop:"8px"}}>
                    <span style={{fontSize:"15px",color:T.muted}}>Subtotal (nett)</span>
                    <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"18px",color:T.ink}}>IDR {nettTotal.toLocaleString("id-ID")}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0 8px"}}>
                    <span style={{fontSize:"15px",color:T.muted}}>Pajak 11% + Service 10%</span>
                    <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"18px",color:T.muted}}>IDR {taxAmt.toLocaleString("id-ID")}</span>
                  </div>
                </>}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0 0",borderTop:`2px solid ${T.lineD}`}}>
                  <span style={{fontSize:"15px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted}}>{resto.isTakeaway?"Total":"Perkiraan Harga (Sponsor)"}</span>
                  <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"23px",color:T.forest,fontWeight:500}}>IDR {grandTotal.toLocaleString("id-ID")}</span>
                </div>
              </>}
            </>;
          })()}
          <button onClick={submit} disabled={saving||locked} style={{marginTop:"24px",width:"100%",padding:"14px",background:locked?T.muted:T.forest,color:"white",border:"none",cursor:locked?"not-allowed":"pointer",fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",fontWeight:500,transition:"background 0.2s"}}>
            {saving?"Menyimpan ke Firebase…":locked?"Pemesanan Ditutup":"Konfirmasi Pesanan Saya"}
          </button>
        </div>}
      </div>}

      {tab==="recap"&&<div>
        {!showRecap&&<p style={{fontSize:"16px",color:T.muted,fontStyle:"italic",padding:"20px 0"}}>Submit order Anda terlebih dahulu untuk melihat rekap semua peserta.</p>}
        {showRecap&&<>
          <div style={{marginBottom:"48px"}}>
            <p style={{fontSize:"13px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"24px"}}>Rekap Per Menu</p>
            {(()=>{
              const grandAllTotal = Object.values(allOrders).reduce((s,o)=>s+Number(o.totalIDR||0),0);
              const totalBoxes = Object.values(allOrders).reduce((s,o)=>s+(o.items||[]).reduce((ss,i)=>ss+Number(i.qty),0),0);
              if(!grandAllTotal&&!totalBoxes) return null;
              return (
                <div style={{display:"grid",gridTemplateColumns:resto.id!=="solaria"?"1fr 1fr":"1fr",gap:"1px",background:T.line,marginBottom:"32px"}}>
                    <div style={{background:T.cream,padding:"20px 24px"}}>
                      <p style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"8px"}}>Total Item Dipesan</p>
                      <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"28px",color:T.ink}}>{totalBoxes} <span style={{fontSize:"17px",color:T.muted}}>item</span></p>
                    </div>
                    {resto.id!=="solaria"&&grandAllTotal>0&&(
                      <div style={{background:T.cream,padding:"20px 24px"}}>
                        <p style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"8px"}}>{resto.isTakeaway?"Total Pesanan":"Perkiraan Total (Sponsor)"}</p>
                        <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"21px",color:T.forest}}>IDR {grandAllTotal.toLocaleString("id-ID")}</p>
                      </div>
                    )}
                  </div>
              );
            })()}
            {(()=>{
              const tally={};
              Object.values(allOrders).forEach(o=>(o.items||[]).forEach(i=>{const k=i.config?`${i.name} [${i.config}]`:i.name;tally[k]=(tally[k]||0)+Number(i.qty);}));
              const sorted=Object.entries(tally).sort((a,b)=>b[1]-a[1]);
              if(!sorted.length) return <p style={{fontSize:"16px",color:T.muted,fontStyle:"italic"}}>Belum ada pesanan.</p>;
              return <div style={{borderTop:`1px solid ${T.line}`}}>
                {sorted.map(([name,qty])=>(
                  <div key={name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 0",borderBottom:`1px solid ${T.line}`}}>
                    <span style={{fontSize:"17px",color:T.ink}}>{name}</span>
                    <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"21px",color:T.forest}}>{qty}×</span>
                  </div>
                ))}
              </div>;
            })()}
          </div>
          <div>
            <p style={{fontSize:"13px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"24px"}}>Status Per Peserta — {ordered}/{total}</p>
            <div style={{borderTop:`1px solid ${T.line}`}}>
              {resto.participants.map(p=>{
                const o=allOrders[p.name];
                const isMe=p.name===user;
                return (
                  <div key={p.name} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"16px",alignItems:"start",borderBottom:`1px solid ${T.line}`,padding:"16px 0",background:isMe?T.cream:"transparent"}}>
                    <div>
                      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"4px",flexWrap:"wrap"}}>
                        <span style={{fontSize:"17px",color:T.ink,fontWeight:o?500:300}}>{p.name}</span>
                        {isMe&&<span style={{fontSize:"13px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.gold}}>Anda</span>}
                        <span style={{fontSize:"14px",color:T.muted}}>({p.hh})</span>
                      </div>
                      {o&&<div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"8px",marginBottom:"4px"}}>
                          {(o.items||[]).map((it,i)=><span key={i} style={{fontSize:"14px",color:T.muted}}>• {it.name}{it.config&&` [${it.config}]`} ×{it.qty}{it.notes&&` (${it.notes})`}</span>)}
                        </div>
                        {resto.isTakeaway&&o.totalIDR>0&&<p style={{fontSize:"16px",color:T.settled,fontFamily:"'Playfair Display',Georgia,serif",marginTop:"2px"}}>Total: IDR {Number(o.totalIDR).toLocaleString("id-ID")}</p>}
                      </div>}
                    </div>
                    <p style={{fontSize:"13px",letterSpacing:"1.5px",textTransform:"uppercase",color:o?T.settled:T.ghost,marginTop:"3px",whiteSpace:"nowrap"}}>{o?"✓ Terkirim":"Belum Order"}</p>
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
            <p style={{fontSize:"14px",letterSpacing:"3px",textTransform:"uppercase",color:"#9c8e82",marginBottom:"16px"}}>Terjadi Kesalahan</p>
            <h2 style={{fontFamily:"Georgia,serif",fontSize:"24px",color:"#1a1512",marginBottom:"24px"}}>App crashed — detail untuk koordinator:</h2>
            <pre style={{background:"#fff",padding:"20px",fontSize:"15px",color:"#7a2e20",overflowX:"auto",border:"1px solid #e0d5c8",whiteSpace:"pre-wrap",wordBreak:"break-all"}}>
              {this.state.error.toString()}{"\n\n"}{this.state.error.stack}
            </pre>
            <button onClick={()=>window.location.reload()} style={{marginTop:"24px",background:"none",border:"1px solid #243d30",padding:"10px 24px",cursor:"pointer",fontSize:"15px",letterSpacing:"2px",textTransform:"uppercase",color:"#243d30"}}>Muat Ulang</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UKURAN PAKAIAN — data & komponen
// ═══════════════════════════════════════════════════════════════════════════
const SIZE_DEADLINE = new Date("2026-06-07T23:59:59+07:00"); // 7 Juni 2026, 23:59 WIB
const SIZE_DEADLINE_LABEL = "7 Juni 2026, 23:59 WIB";
const SIZE_GARMENTS = [
  {
    id:"baju", label:"Baju (Kaos Unisex)", unit:"cm",
    measure:"Cara ukur: rebahkan kaos yang sudah pas, ukur lebar dada dari ketiak ke ketiak (cm).",
    helperLabel:"Lebar dada baju — ketiak ke ketiak (cm)",
    chartCols:["Ukuran","Lebar Dada (cm)","Panjang (cm)"],
    groups:[
      {name:"Anak", items:[
        {v:"Anak 2-3th", cm:31, row:["31","40"]},
        {v:"Anak 4-5th", cm:33, row:["33","44"]},
        {v:"Anak 6-7th", cm:35, row:["35","48"]},
        {v:"Anak 8-9th", cm:37, row:["37","52"]},
        {v:"Anak 10-11th", cm:39, row:["39","56"]},
        {v:"Anak 12-13th", cm:41, row:["41","60"]},
      ]},
      {name:"Dewasa", items:[
        {v:"S", cm:47, row:["47","67"]},
        {v:"M", cm:49, row:["49","70"]},
        {v:"L", cm:52, row:["52","72"]},
        {v:"XL", cm:55, row:["55","74"]},
        {v:"XXL", cm:58, row:["58","76"]},
        {v:"XXXL", cm:61, row:["61","78"]},
      ]},
    ],
    brands:{
      Uniqlo:{S:"S",M:"M",L:"L",XL:"XL",XXL:"XXL"},
      Zara:{S:"S",M:"S",L:"M",XL:"L",XXL:"XL"},
      Mango:{S:"S",M:"M",L:"L",XL:"XL",XXL:"XXL"},
      "M&S":{S:"M",M:"L",L:"XL",XL:"XXL",XXL:"XXXL"},
    },
    brandSizes:["S","M","L","XL","XXL"],
  },
  {
    id:"celana", label:"Celana (Pinggang Tidak Elastis)", unit:"cm",
    measure:"Cara ukur: ukur lingkar pinggang celana yang sudah pas, atau lingkar pinggang badan (cm).",
    helperLabel:"Lingkar pinggang (cm)",
    chartCols:["Ukuran","Lingkar Pinggang (cm)"],
    groups:[
      {name:"Anak", items:[
        {v:"Anak 2-3th", cm:49, row:["48–50"]},
        {v:"Anak 4-5th", cm:51, row:["50–53"]},
        {v:"Anak 6-7th", cm:54, row:["53–56"]},
        {v:"Anak 8-9th", cm:57, row:["56–59"]},
        {v:"Anak 10-11th", cm:60, row:["59–62"]},
        {v:"Anak 12-13th", cm:64, row:["62–66"]},
      ]},
      {name:"Dewasa (nomor pinggang)", items:[
        {v:"28", cm:71, row:["71"]},
        {v:"29", cm:74, row:["74"]},
        {v:"30", cm:76, row:["76"]},
        {v:"31", cm:79, row:["79"]},
        {v:"32", cm:81, row:["81"]},
        {v:"33", cm:84, row:["84"]},
        {v:"34", cm:86, row:["86"]},
        {v:"36", cm:91, row:["91"]},
        {v:"38", cm:97, row:["97"]},
        {v:"40", cm:102, row:["102"]},
        {v:"42", cm:107, row:["107"]},
        {v:"44", cm:112, row:["112"]},
        {v:"46", cm:117, row:["117"]},
        {v:"48", cm:122, row:["122"]},
      ]},
    ],
    // brand mode: pilih nomor pinggang merek; Zara/Mango EU slim → +1 nomor
    brands:{
      Uniqlo:"same", "M&S":"same", Zara:"up", Mango:"up",
    },
    brandSizes:["28","29","30","31","32","33","34","36","38","40","42","44","46","48"],
    adultNumbers:["28","29","30","31","32","33","34","36","38","40","42","44","46","48"],
  },
  {
    id:"topi", label:"Topi / Blangkon", unit:"cm",
    measure:"Cara ukur: ukur lingkar kepala melingkar di atas alis & telinga (cm).",
    helperLabel:"Lingkar kepala (cm)",
    chartCols:["Ukuran","Lingkar Kepala (cm)"],
    noBrand:true,
    groups:[
      {name:"Anak", items:[
        {v:"Anak S", cm:49, row:["48–50"]},
        {v:"Anak L", cm:52, row:["51–53"]},
      ]},
      {name:"Dewasa", items:[
        {v:"Dewasa S", cm:54.5, row:["54–55"]},
        {v:"Dewasa M", cm:56.5, row:["56–57"]},
        {v:"Dewasa L", cm:58.5, row:["58–59"]},
        {v:"Dewasa XL", cm:60.5, row:["60–61"]},
      ]},
    ],
  },
  {
    id:"sepatu", label:"Sepatu (EU)", unit:"cm",
    measure:"Cara ukur: ukur panjang telapak kaki dari tumit ke ujung jari terpanjang (cm). Disarankan +1 cm kelonggaran.",
    helperLabel:"Panjang telapak kaki (cm)",
    chartCols:["EU","Panjang Kaki (cm)"],
    groups:[
      {name:"Anak", items:[
        {v:"28", cm:17, row:["±17"]},
        {v:"29", cm:17.5, row:["±17,5"]},
        {v:"30", cm:18.5, row:["±18,5"]},
        {v:"31", cm:19, row:["±19"]},
        {v:"32", cm:20, row:["±20"]},
        {v:"33", cm:20.5, row:["±20,5"]},
        {v:"34", cm:21.5, row:["±21,5"]},
      ]},
      {name:"Dewasa", items:[
        {v:"35", cm:22, row:["±22"]},
        {v:"36", cm:22.5, row:["±22,5"]},
        {v:"37", cm:23.5, row:["±23,5"]},
        {v:"38", cm:24, row:["±24"]},
        {v:"39", cm:25, row:["±25"]},
        {v:"40", cm:25.5, row:["±25,5"]},
        {v:"41", cm:26, row:["±26"]},
        {v:"42", cm:27, row:["±27"]},
        {v:"43", cm:27.5, row:["±27,5"]},
        {v:"44", cm:28, row:["±28"]},
        {v:"45", cm:29, row:["±29"]},
        {v:"46", cm:29.5, row:["±29,5"]},
      ]},
    ],
    // brand mode: pilih merek + EU; Adidas EU sama, Nike agak sempit (saran naik bila ragu)
    brands:{Adidas:"same", Nike:"snug"},
    brandSizes:["38","39","40","41","42","43","44","45","46"],
  },
];

// helper: cari ukuran terdekat berdasarkan nilai cm
const suggestByCm = (garment, val) => {
  const num = parseFloat(String(val).replace(",","."));
  if(isNaN(num)||num<=0) return null;
  let best=null, bestDiff=Infinity;
  garment.groups.forEach(g=>g.items.forEach(it=>{
    const d=Math.abs(it.cm-num);
    if(d<bestDiff){ bestDiff=d; best=it.v; }
  }));
  return best;
};
// helper: saran berdasarkan merek
const suggestByBrand = (garment, brand, brandSize) => {
  if(garment.id==="baju"){ return garment.brands[brand]?.[brandSize]||null; }
  if(garment.id==="celana"){
    const rule=garment.brands[brand]; const nums=garment.adultNumbers;
    const idx=nums.indexOf(brandSize); if(idx<0) return null;
    if(rule==="same") return brandSize;
    return nums[Math.min(idx+1, nums.length-1)]; // up 1 (Zara/Mango)
  }
  if(garment.id==="sepatu"){
    const rule=garment.brands[brand];
    if(rule==="same") return brandSize;
    // Nike snug: kalau ragu, naik 1
    const n=parseInt(brandSize,10); return String(n); // tampilkan sama, beri catatan naik bila ragu
  }
  return null;
};

const isSizeComplete = r => !!(r && r.baju && r.celana && r.topi && r.sepatu);

const SizeCountdown = memo(() => {
  const [now,setNow] = useState(Date.now());
  useEffect(()=>{ const id=setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(id); },[]);
  const diff = SIZE_DEADLINE.getTime() - now;

  if(diff<=0) return (
    <div style={{background:T.dangerBg,border:"1px solid #e8b4a8",borderLeft:`3px solid ${T.danger}`,padding:"18px 22px",marginBottom:"32px",display:"flex",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
      <span style={{width:"8px",height:"8px",borderRadius:"50%",background:T.danger,display:"inline-block"}}/>
      <p style={{fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",color:T.danger,fontWeight:500,margin:0}}>Pengumpulan ukuran telah ditutup</p>
      <span style={{fontSize:"14px",color:T.muted}}>Deadline {SIZE_DEADLINE_LABEL} terlewati</span>
    </div>
  );

  const d=Math.floor(diff/86400000), h=Math.floor((diff%86400000)/3600000), m=Math.floor((diff%3600000)/60000), s=Math.floor((diff%60000)/1000);
  const urgent = diff < 86400000; // < 24 jam
  const accent = urgent ? T.danger : T.forest;
  const units = [{n:d,l:"Hari"},{n:h,l:"Jam"},{n:m,l:"Menit"},{n:s,l:"Detik"}];

  return (
    <div style={{background:T.cream,border:`1px solid ${urgent?"#e8b4a8":T.line}`,borderLeft:`3px solid ${accent}`,padding:"20px 24px",marginBottom:"32px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"18px"}}>
        <div>
          <p style={{fontSize:"12px",letterSpacing:"3px",textTransform:"uppercase",color:urgent?T.danger:T.muted,marginBottom:"4px",fontWeight:urgent?500:400}}>{urgent?"Segera dikunci":"Form dikunci dalam"}</p>
          <p style={{fontSize:"13px",color:T.muted}}>Deadline {SIZE_DEADLINE_LABEL}</p>
        </div>
        <div style={{display:"flex",gap:"18px"}}>
          {units.map((u,i)=>(
            <div key={u.l} style={{display:"flex",alignItems:"flex-start",gap:"18px"}}>
              <div style={{textAlign:"center",minWidth:"42px"}}>
                <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"30px",fontWeight:500,color:accent,lineHeight:1}}>{String(u.n).padStart(2,"0")}</p>
                <p style={{fontSize:"12px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.muted,marginTop:"6px"}}>{u.l}</p>
              </div>
              {i<units.length-1&&<span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"26px",color:T.ghost,lineHeight:1.1}}>:</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const SizeTab = memo(({user}) => {
  const isCoord = COORDINATORS.includes(user);
  const myHH = ALL_PAX.find(p=>p.name===user)?.hh;
  const pastDeadline = new Date() > SIZE_DEADLINE;
  const [tab,setTab] = useState("form");
  const [allSizes,setAllSizes] = useState({});
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [syncError,setSyncError] = useState(null);
  const [lastSync,setLastSync] = useState(null);
  const [target,setTarget] = useState(user); // peserta yang sedang diisi
  const [draft,setDraft] = useState({baju:"",celana:"",topi:"",sepatu:"",catatan:""});
  const [openChart,setOpenChart] = useState(null);   // garment id chart terbuka
  const [openHelper,setOpenHelper] = useState(null); // garment id helper terbuka
  const [helperMode,setHelperMode] = useState("cm"); // cm | brand
  const [helperCm,setHelperCm] = useState("");
  const [helperBrand,setHelperBrand] = useState("");
  const [helperBrandSize,setHelperBrandSize] = useState("");
  const [helperResult,setHelperResult] = useState(null);

  // siapa saja yang bisa diisi user ini: diri sendiri + anggota household
  const fillableFor = ALL_PAX.filter(p => p.name===user || (isCoord ? true : p.hh===myHH));

  const loadAll = useCallback(async () => {
    try {
      const keys = await sList("size.");
      const grouped = {};
      for(const k of keys){
        const v = await sGet(k);
        if(v){ const name=k.replace("size.","").replace(/_/g," "); grouped[name]=JSON.parse(v); }
      }
      setAllSizes(grouped);
      setLastSync(new Date());
    } catch { setSyncError("Gagal memuat data. Cek koneksi."); }
  }, []);

  useEffect(()=>{ (async()=>{ setLoading(true); await loadAll(); setLoading(false); })(); }, [loadAll]);
  useEffect(()=>{ const id=setInterval(loadAll,30000); return ()=>clearInterval(id); },[loadAll]);

  // saat target berganti, isi draft dari data tersimpan (kalau ada)
  useEffect(()=>{
    const ex = allSizes[target];
    setDraft(ex ? {baju:ex.baju||"",celana:ex.celana||"",topi:ex.topi||"",sepatu:ex.sepatu||"",catatan:ex.catatan||""}
                : {baju:"",celana:"",topi:"",sepatu:"",catatan:""});
    setOpenChart(null); setOpenHelper(null); setHelperResult(null); setHelperCm(""); setHelperBrand(""); setHelperBrandSize("");
  }, [target, allSizes]);

  const setField = (gid,val) => setDraft(d=>({...d,[gid]:d[gid]===val?"":val}));

  const submit = async () => {
    if(saving) return;
    if(pastDeadline && !isCoord){ setSyncError("Pengumpulan ukuran telah ditutup. Hubungi koordinator untuk perubahan."); return; }
    const missing = SIZE_GARMENTS.filter(g=>!draft[g.id]).map(g=>g.label.split(" ")[0]);
    if(missing.length){ setSyncError(`Lengkapi semua ukuran sebelum konfirmasi. Belum diisi: ${missing.join(", ")}.`); return; }
    setSaving(true); setSyncError(null);
    try {
      const key = `size.${target.replace(/\s+/g,"_")}`;
      const rec = {peserta:target, hh:ALL_PAX.find(p=>p.name===target)?.hh||"",
        baju:draft.baju, celana:draft.celana, topi:draft.topi, sepatu:draft.sepatu,
        catatan:draft.catatan||"", filledBy:user, submittedAt:new Date().toISOString()};
      const ok = await sSet(key, JSON.stringify(rec));
      if(ok){ await loadAll(); setTab("recap"); }
      else setSyncError("Gagal menyimpan. Coba lagi.");
    } catch { setSyncError("Gagal menyimpan. Coba lagi."); }
    setSaving(false);
  };

  const runHelper = (garment) => {
    let res=null, note="";
    if(helperMode==="cm"){ res=suggestByCm(garment, helperCm); if(garment.id==="sepatu"&&res) note="Disarankan +1 cm kelonggaran — bila di antara dua nomor, ambil yang lebih besar."; }
    else { if(helperBrand&&helperBrandSize){ res=suggestByBrand(garment, helperBrand, helperBrandSize);
      if(garment.id==="sepatu"&&helperBrand==="Nike") note="Nike cenderung agak sempit — bila ragu, ambil satu nomor lebih besar.";
      if(garment.id==="celana"&&(helperBrand==="Zara"||helperBrand==="Mango")) note="Celana EU Zara/Mango potongan slim — nomor sudah disesuaikan naik 1.";
    }}
    setHelperResult(res?{size:res,note}:{size:null,note:"Lengkapi dulu input di atas."});
  };

  const exportCSV = () => {
    const rows=[["Nama","HH","Baju","Celana","Topi","Sepatu","Catatan","Diisi Oleh"]];
    ALL_PAX.forEach(p=>{ const s=allSizes[p.name]||{}; rows.push([p.name,p.hh,s.baju||"",s.celana||"",s.topi||"",s.sepatu||"",s.catatan||"",s.filledBy||""]); });
    const csv=rows.map(r=>r.map(c=>`"${c}"`).join(",")).join("\n");
    const a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));
    a.download="Ukuran_Pakaian_PompOpSahat.csv"; a.click();
  };

  const filledCount = ALL_PAX.filter(p=>isSizeComplete(allSizes[p.name])).length;

  if(loading) return (<div style={{textAlign:"center",padding:"80px 0",color:T.muted}}><p style={{fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase"}}>Memuat data dari Firebase…</p></div>);

  return (
    <div className="fade-up">
      <div style={{marginBottom:"40px"}}>
        <p style={{fontSize:"13px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"12px"}}>Pengumpulan Ukuran</p>
        <h2 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"36px",fontWeight:400,color:T.ink}}>Ukuran Pakaian</h2>
        <p style={{fontSize:"15px",color:T.muted,marginTop:"8px"}}>Baju, celana, topi/blangkon & sepatu untuk seluruh peserta. Orang tua dapat mengisikan untuk anggota keluarga.</p>
        <p style={{fontSize:"14px",color:pastDeadline?T.danger:T.warn,marginTop:"10px",letterSpacing:"0.3px"}}>{pastDeadline?`Pengumpulan ukuran telah ditutup (deadline ${SIZE_DEADLINE_LABEL}).`:`Deadline pengisian: ${SIZE_DEADLINE_LABEL} · dapat diubah & submit ulang kapan saja sebelum deadline.`}</p>
      </div>

      <SizeCountdown/>

      <div style={{display:"flex",borderBottom:`1px solid ${T.line}`,marginBottom:"40px"}}>
        {[{id:"form",label:"Form Ukuran"},{id:"recap",label:`Rekap — ${filledCount}/${ALL_PAX.length}`}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",padding:"0 32px 16px 0",cursor:"pointer",fontSize:"14px",letterSpacing:"2px",textTransform:"uppercase",fontWeight:tab===t.id?500:300,color:tab===t.id?T.forest:T.muted,borderBottom:tab===t.id?`2px solid ${T.forest}`:"2px solid transparent",marginBottom:"-1px",transition:"all 0.2s"}}>{t.label}</button>
        ))}
      </div>

      {syncError&&<div style={{background:T.dangerBg,border:"1px solid #e8b4a8",padding:"12px 16px",marginBottom:"24px"}}><p style={{fontSize:"14px",color:T.danger}}>{syncError}</p></div>}

      {tab==="form"&&<div>
        {/* pilih untuk siapa */}
        <div style={{marginBottom:"32px"}}>
          <p style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"14px"}}>Mengisi untuk</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:"8px"}}>
            {fillableFor.map(p=>{
              const done = isSizeComplete(allSizes[p.name]);
              const sel = target===p.name;
              return (
                <button key={p.name} onClick={()=>setTarget(p.name)} style={{background:sel?T.forest:"transparent",border:`1px solid ${sel?T.forest:T.lineD}`,color:sel?"white":T.mid,padding:"7px 14px",cursor:"pointer",fontSize:"14px",letterSpacing:"0.3px",transition:"all 0.15s",display:"flex",alignItems:"center",gap:"7px"}}>
                  {p.name===user?"Saya — ":""}{p.name.split(" ")[0]} {done&&<span style={{fontSize:"12px",color:sel?"#cfe0cc":T.settled}}>✓</span>}
                </button>
              );
            })}
          </div>
          {target!==user&&<p style={{fontSize:"13px",color:T.muted,fontStyle:"italic",marginTop:"10px"}}>Anda mengisi untuk {target}. Akan tercatat "diisi oleh {user}".</p>}
          {allSizes[target]&&(allSizes[target].baju||allSizes[target].celana||allSizes[target].topi||allSizes[target].sepatu)&&(
            <div style={{background:T.settledBg,border:`1px solid ${T.settled}`,padding:"10px 14px",marginTop:"12px"}}>
              <p style={{fontSize:"13px",color:T.settled}}>✓ Ukuran {target===user?"Anda":target.split(" ")[0]} sudah tersimpan. Anda dapat mengubah pilihan di bawah lalu konfirmasi ulang — data lama akan ditimpa.</p>
            </div>
          )}
        </div>

        <p style={{fontSize:"14px",color:T.muted,marginBottom:"28px",letterSpacing:"0.3px"}}>Semua ukuran <span style={{color:T.gold,fontWeight:500}}>wajib diisi lengkap</span> — baju, celana, topi & sepatu — sebelum dapat dikonfirmasi.</p>

        {/* field tiap garment */}
        {SIZE_GARMENTS.map(g=>(
          <div key={g.id} style={{marginBottom:"36px",paddingBottom:"32px",borderBottom:`1px solid ${T.line}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",flexWrap:"wrap",gap:"8px",marginBottom:"14px"}}>
              <h3 style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"21px",fontWeight:400,color:T.ink}}>{g.label} <span style={{color:draft[g.id]?T.settled:T.gold,fontSize:"16px"}}>{draft[g.id]?"✓":"*"}</span></h3>
              <div style={{display:"flex",gap:"16px"}}>
                <button onClick={()=>{setOpenChart(openChart===g.id?null:g.id);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:"13px",letterSpacing:"1px",textTransform:"uppercase",color:T.muted,borderBottom:`1px solid ${openChart===g.id?T.forest:"transparent"}`,padding:"2px 0"}}>Panduan ukuran</button>
                <button onClick={()=>{setOpenHelper(openHelper===g.id?null:g.id);setHelperMode("cm");setHelperResult(null);setHelperCm("");setHelperBrand("");setHelperBrandSize("");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:"13px",letterSpacing:"1px",textTransform:"uppercase",color:T.gold,borderBottom:`1px solid ${openHelper===g.id?T.gold:"transparent"}`,padding:"2px 0"}}>Bantu pilih ukuran</button>
              </div>
            </div>

            {/* chart panel */}
            {openChart===g.id&&(
              <div style={{background:T.cream,padding:"18px 20px",marginBottom:"16px",border:`1px solid ${T.line}`}}>
                <p style={{fontSize:"13px",color:T.muted,fontStyle:"italic",marginBottom:"14px"}}>{g.measure}</p>
                {g.groups.map(grp=>(
                  <div key={grp.name} style={{marginBottom:"14px"}}>
                    <p style={{fontSize:"12px",letterSpacing:"2px",textTransform:"uppercase",color:T.forest,marginBottom:"8px"}}>{grp.name}</p>
                    <div style={{display:"grid",gridTemplateColumns:`90px repeat(${g.chartCols.length-1},1fr)`,gap:"2px 12px",fontSize:"14px"}}>
                      {g.chartCols.map((c,i)=><span key={c} style={{fontSize:"12px",letterSpacing:"1px",textTransform:"uppercase",color:T.muted,paddingBottom:"4px",borderBottom:`1px solid ${T.lineD}`,textAlign:i===0?"left":"right"}}>{c}</span>)}
                      {grp.items.map(it=>(<Fragment key={it.v}>
                        <span style={{color:T.ink,paddingTop:"3px"}}>{it.v}</span>
                        {it.row.map((cell,j)=><span key={j} style={{color:T.mid,textAlign:"right",paddingTop:"3px",fontFamily:"'Playfair Display',Georgia,serif"}}>{cell}</span>)}
                      </Fragment>))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* helper panel */}
            {openHelper===g.id&&(
              <div style={{background:"#f6f3ec",padding:"18px 20px",marginBottom:"16px",border:`1px solid ${T.goldL}`}}>
                <div style={{display:"flex",gap:"6px",marginBottom:"14px"}}>
                  <button onClick={()=>{setHelperMode("cm");setHelperResult(null);}} style={{flex:"0 0 auto",background:helperMode==="cm"?T.gold:"transparent",border:`1px solid ${T.goldL}`,color:helperMode==="cm"?"white":T.mid,padding:"5px 14px",cursor:"pointer",fontSize:"13px",letterSpacing:"1px",textTransform:"uppercase"}}>Ukur (cm)</button>
                  {!g.noBrand&&<button onClick={()=>{setHelperMode("brand");setHelperResult(null);}} style={{flex:"0 0 auto",background:helperMode==="brand"?T.gold:"transparent",border:`1px solid ${T.goldL}`,color:helperMode==="brand"?"white":T.mid,padding:"5px 14px",cursor:"pointer",fontSize:"13px",letterSpacing:"1px",textTransform:"uppercase"}}>Dari merek lain</button>}
                </div>

                {helperMode==="cm"&&<div>
                  <p style={{fontSize:"13px",color:T.muted,marginBottom:"10px"}}>{g.measure}</p>
                  <div style={{display:"flex",gap:"10px",alignItems:"center",flexWrap:"wrap"}}>
                    <input value={helperCm} onChange={e=>setHelperCm(e.target.value)} inputMode="decimal" placeholder={g.helperLabel}
                      style={{flex:"1 1 200px",padding:"10px 12px",border:`1px solid ${T.lineD}`,background:"white",fontSize:"15px",color:T.ink,outline:"none"}}/>
                    <button onClick={()=>runHelper(g)} style={{background:T.gold,border:"none",color:"white",padding:"10px 20px",cursor:"pointer",fontSize:"13px",letterSpacing:"1.5px",textTransform:"uppercase"}}>Sarankan</button>
                  </div>
                </div>}

                {helperMode==="brand"&&!g.noBrand&&<div>
                  <p style={{fontSize:"13px",color:T.muted,marginBottom:"10px"}}>Pilih merek yang biasa Anda pakai, lalu ukuran existing Anda.</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"10px"}}>
                    {Object.keys(g.brands).map(b=>(
                      <button key={b} onClick={()=>{setHelperBrand(b);setHelperResult(null);}} style={{background:helperBrand===b?T.forest:"transparent",border:`1px solid ${helperBrand===b?T.forest:T.lineD}`,color:helperBrand===b?"white":T.mid,padding:"6px 14px",cursor:"pointer",fontSize:"14px"}}>{b}</button>
                    ))}
                  </div>
                  {helperBrand&&<div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginBottom:"12px"}}>
                    {g.brandSizes.map(s=>(
                      <button key={s} onClick={()=>{setHelperBrandSize(s);setHelperResult(null);}} style={{background:helperBrandSize===s?T.gold:"transparent",border:`1px solid ${helperBrandSize===s?T.gold:T.lineD}`,color:helperBrandSize===s?"white":T.mid,padding:"6px 14px",cursor:"pointer",fontSize:"14px"}}>{g.id==="sepatu"?`EU ${s}`:s}</button>
                    ))}
                  </div>}
                  <button onClick={()=>runHelper(g)} disabled={!helperBrand||!helperBrandSize} style={{background:helperBrand&&helperBrandSize?T.gold:T.lineD,border:"none",color:"white",padding:"9px 20px",cursor:helperBrand&&helperBrandSize?"pointer":"not-allowed",fontSize:"13px",letterSpacing:"1.5px",textTransform:"uppercase"}}>Sarankan</button>
                  <p style={{fontSize:"12px",color:T.muted,fontStyle:"italic",marginTop:"10px"}}>Perkiraan — verifikasi dengan panduan cm. Potongan tiap merek berbeda.</p>
                </div>}

                {helperResult&&<div style={{marginTop:"14px",paddingTop:"14px",borderTop:`1px solid ${T.goldL}`}}>
                  {helperResult.size
                    ? <div style={{display:"flex",alignItems:"center",gap:"14px",flexWrap:"wrap"}}>
                        <span style={{fontSize:"13px",color:T.muted}}>Saran ukuran:</span>
                        <span style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"23px",color:T.forest,fontWeight:500}}>{g.id==="sepatu"?`EU ${helperResult.size}`:helperResult.size}</span>
                        <button onClick={()=>setDraft(d=>({...d,[g.id]:helperResult.size}))} style={{background:"none",border:`1px solid ${T.forest}`,color:T.forest,padding:"6px 16px",cursor:"pointer",fontSize:"13px",letterSpacing:"1px",textTransform:"uppercase"}}>Pakai ini</button>
                      </div>
                    : <p style={{fontSize:"14px",color:T.danger}}>{helperResult.note}</p>}
                  {helperResult.size&&helperResult.note&&<p style={{fontSize:"13px",color:T.muted,fontStyle:"italic",marginTop:"8px"}}>{helperResult.note}</p>}
                </div>}
              </div>
            )}

            {/* pilihan ukuran */}
            {g.groups.map(grp=>(
              <div key={grp.name} style={{marginBottom:"12px"}}>
                <p style={{fontSize:"12px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.muted,marginBottom:"8px"}}>{grp.name}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>
                  {grp.items.map(it=>{
                    const sel=draft[g.id]===it.v;
                    return <button key={it.v} onClick={()=>setField(g.id,it.v)} title={it.row.join(" · ")} style={{background:sel?T.forest:"transparent",border:`1px solid ${sel?T.forest:T.lineD}`,color:sel?"white":T.mid,padding:"7px 14px",cursor:"pointer",fontSize:"14px",letterSpacing:"0.3px",transition:"all 0.15s"}}>{g.id==="sepatu"?`EU ${it.v}`:it.v}</button>;
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* catatan */}
        <div style={{marginBottom:"32px"}}>
          <p style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted,marginBottom:"10px"}}>Catatan (opsional)</p>
          <input value={draft.catatan} onChange={e=>setDraft(d=>({...d,catatan:e.target.value}))} placeholder="mis. suka fit longgar, alergi bahan tertentu"
            style={{width:"100%",maxWidth:"460px",padding:"10px 0",border:"none",borderBottom:`1px solid ${T.lineD}`,background:"transparent",fontSize:"15px",color:T.mid,outline:"none"}}/>
        </div>

        {/* ringkasan + submit */}
        <div style={{background:T.cream,padding:"24px",borderTop:`2px solid ${T.forest}`}}>
          <p style={{fontSize:"12px",letterSpacing:"3px",textTransform:"uppercase",color:T.muted,marginBottom:"16px"}}>Ukuran {target===user?"Saya":target}</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:"16px",marginBottom:"20px"}}>
            {SIZE_GARMENTS.map(g=>(
              <div key={g.id}>
                <p style={{fontSize:"12px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.muted,marginBottom:"5px"}}>{g.label.split(" ")[0]}</p>
                <p style={{fontFamily:"'Playfair Display',Georgia,serif",fontSize:"19px",color:draft[g.id]?T.ink:T.danger}}>{draft[g.id]?(g.id==="sepatu"?`EU ${draft[g.id]}`:draft[g.id]):"Belum"}</p>
              </div>
            ))}
          </div>
          {(()=>{
            const already = allSizes[target]&&(allSizes[target].baju||allSizes[target].celana||allSizes[target].topi||allSizes[target].sepatu);
            const blocked = pastDeadline&&!isCoord;
            const nm = target===user?"Saya":target.split(" ")[0];
            return (
              <button onClick={submit} disabled={saving||blocked} style={{width:"100%",padding:"14px",background:blocked?T.muted:T.forest,color:"white",border:"none",cursor:blocked?"not-allowed":saving?"wait":"pointer",fontSize:"13px",letterSpacing:"3px",textTransform:"uppercase",fontWeight:500}}>
                {blocked?"Pengumpulan Ditutup":saving?"Menyimpan…":`${already?"Perbarui":"Konfirmasi"} Ukuran ${nm}`}
              </button>
            );
          })()}
        </div>
      </div>}

      {tab==="recap"&&<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px",flexWrap:"wrap",gap:"12px"}}>
          <p style={{fontSize:"13px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted}}>{filledCount} dari {ALL_PAX.length} peserta sudah mengisi{lastSync&&<span style={{color:T.ghost}}> · {lastSync.toLocaleTimeString("id-ID")}</span>}</p>
          <div style={{display:"flex",gap:"10px"}}>
            <button onClick={loadAll} style={{background:"none",border:`1px solid ${T.line}`,padding:"7px 16px",cursor:"pointer",fontSize:"12px",letterSpacing:"2px",textTransform:"uppercase",color:T.muted}}>↻ Refresh</button>
            {isCoord&&<button onClick={exportCSV} style={{background:T.forest,border:"none",padding:"7px 16px",cursor:"pointer",fontSize:"12px",letterSpacing:"2px",textTransform:"uppercase",color:"white"}}>Export CSV</button>}
          </div>
        </div>
        <div style={{overflowX:"auto"}}>
          <div style={{minWidth:"640px"}}>
            <div style={{display:"grid",gridTemplateColumns:"1.6fr 0.5fr 1fr 0.8fr 1fr 0.8fr",gap:"0 12px",padding:"0 0 10px",borderBottom:`2px solid ${T.lineD}`}}>
              {["Nama","HH","Baju","Celana","Topi","Sepatu"].map(h=><p key={h} style={{fontSize:"12px",letterSpacing:"1.5px",textTransform:"uppercase",color:T.muted}}>{h}</p>)}
            </div>
            {ALL_PAX.map(p=>{
              const s=allSizes[p.name]||{};
              const done=isSizeComplete(s);
              return (
                <div key={p.name} style={{display:"grid",gridTemplateColumns:"1.6fr 0.5fr 1fr 0.8fr 1fr 0.8fr",gap:"0 12px",padding:"12px 0",borderBottom:`1px solid ${T.line}`,alignItems:"center",opacity:done?1:0.55}}>
                  <div>
                    <p style={{fontSize:"15px",color:T.ink}}>{p.name}{p.name===user&&<span style={{fontSize:"12px",color:T.gold}}> (Anda)</span>}</p>
                    {s.filledBy&&s.filledBy!==p.name&&<p style={{fontSize:"12px",color:T.ghost,fontStyle:"italic"}}>diisi oleh {s.filledBy.split(" ")[0]}</p>}
                  </div>
                  <p style={{fontSize:"14px",color:T.muted}}>{p.hh}</p>
                  <p style={{fontSize:"15px",color:s.baju?T.ink:T.ghost}}>{s.baju||"—"}</p>
                  <p style={{fontSize:"15px",color:s.celana?T.ink:T.ghost}}>{s.celana||"—"}</p>
                  <p style={{fontSize:"15px",color:s.topi?T.ink:T.ghost}}>{s.topi||"—"}</p>
                  <p style={{fontSize:"15px",color:s.sepatu?T.ink:T.ghost}}>{s.sepatu?`EU ${s.sepatu}`:"—"}</p>
                </div>
              );
            })}
          </div>
        </div>
        <p style={{fontSize:"13px",color:T.muted,fontStyle:"italic",marginTop:"20px"}}>Catatan ukuran (bila ada) tersimpan & muncul di Export CSV.</p>
      </div>}
    </div>
  );
});

const SESSION_KEY = "pos_session";
const IDLE_MS = 15 * 60 * 1000; // 15 menit idle / tidak diakses
const loadSession = () => {
  try { const s = JSON.parse(localStorage.getItem(SESSION_KEY)||"null");
    if(s && s.user && s.ts && (Date.now()-s.ts < IDLE_MS)) return s; } catch {}
  return null;
};
const saveSession = user => { try { localStorage.setItem(SESSION_KEY, JSON.stringify({user, ts:Date.now()})); } catch {} };
const touchSession = () => { try { const s=JSON.parse(localStorage.getItem(SESSION_KEY)||"null"); if(s&&s.user){ s.ts=Date.now(); localStorage.setItem(SESSION_KEY, JSON.stringify(s)); } } catch {} };
const clearSession = () => { try { localStorage.removeItem(SESSION_KEY); } catch {} };

export default function App() {
  const initial = typeof window!=="undefined" ? loadSession() : null;
  const [screen,setScreen] = useState(initial ? "main" : "password");
  const [user,setUser] = useState(initial ? initial.user : "");
  const [tab,setTab] = useState("itinerary");

  const audioRef = useRef(null);
  const [musicMuted,setMusicMuted] = useState(()=>{ try{ return localStorage.getItem("pos_music_muted")==="1"; }catch{ return false; } });
  const startMusic = useCallback(()=>{
    const a=audioRef.current; if(!a) return;
    a.volume=0.5;
    try{ a.muted = localStorage.getItem("pos_music_muted")==="1"; }catch{}
    a.play().catch(()=>{});
  },[]);
  const toggleMute = useCallback(()=>{
    setMusicMuted(m=>{
      const nm=!m;
      try{ localStorage.setItem("pos_music_muted", nm?"1":"0"); }catch{}
      const a=audioRef.current;
      if(a){ a.muted=nm; if(!nm){ a.volume=0.5; a.play().catch(()=>{}); } }
      return nm;
    });
  },[]);

  // Persistensi sesi: tetap login saat refresh; logout hanya setelah 15 menit idle / tidak diakses
  useEffect(() => {
    if(screen!=="main") return;
    touchSession();
    const logout = () => { clearSession(); setUser(""); setScreen("password"); };
    let last = Date.now();
    const onActivity = () => { const now=Date.now(); if(now-last>10000){ last=now; touchSession(); } };
    const events = ["pointerdown","keydown","touchstart","scroll"];
    events.forEach(e=>window.addEventListener(e,onActivity,{passive:true}));
    const check = setInterval(()=>{ if(!loadSession()) logout(); }, 30000);
    const onVisible = () => { if(document.visibilityState==="visible" && !loadSession()) logout(); };
    document.addEventListener("visibilitychange",onVisible);
    return () => { events.forEach(e=>window.removeEventListener(e,onActivity)); clearInterval(check); document.removeEventListener("visibilitychange",onVisible); };
  }, [screen]);

  useEffect(()=>{
    if(screen!=="main") return;
    startMusic();
    const onFirst=()=>{ startMusic(); window.removeEventListener("pointerdown",onFirst); };
    window.addEventListener("pointerdown",onFirst);
    return ()=>window.removeEventListener("pointerdown",onFirst);
  },[screen,startMusic]);

  return (
    <>
      <audio ref={audioRef} src="/welcome-jogja2.mp3" loop preload="auto" />
      {screen==="password" && <PasswordScreen onSuccess={()=>setScreen("name")}/>}
      {screen==="name" && <NameScreen onSuccess={n=>{setUser(n);saveSession(n);setScreen("main");startMusic();}}/>}
      {screen==="main" && (
        <ErrorBoundary>
          <Shell user={user} tab={tab} setTab={setTab} muted={musicMuted} onToggleMute={toggleMute}>
            {tab==="budget"    && <BudgetTab user={user}/>}
            {tab==="itinerary" && <ItineraryTab/>}
            {tab==="size"      && <SizeTab user={user}/>}
            {tab==="makan"     && <MakanTab user={user}/>}
            {tab==="oleholeh"  && <OlehOlehTab user={user}/>}
          </Shell>
        </ErrorBoundary>
      )}
    </>
  );
}
