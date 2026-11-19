import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const initialData = {
    patients: [
        { id: 1, name: "أحمد محمد", phone: "01012345678", age: 35, gender: "ذكر", address: "طنطا", status: "نشط" },
        { id: 2, name: "سارة محمود", phone: "01123456789", age: 28, gender: "أنثى", address: "المحلة", status: "نشط" },
        { id: 3, name: "محمد علي", phone: "01234567890", age: 45, gender: "ذكر", address: "السنطة", status: "متابعة" }
    ],

    doctors: [
        { id: 1, name: "د. أحمد حسن", specialty: "باطنة", phone: "01011111111", email: "ahmed@example.com", status: "متاح" },
        { id: 2, name: "د. منى إبراهيم", specialty: "أطفال", phone: "01022222222", email: "mona@example.com", status: "متاح" },
        { id: 3, name: "د. محمد سامي", specialty: "أسنان", phone: "01033333333", email: "mohamed@example.com", status: "غير متاح" }
    ],

    employees: [
        { id: 1, name: "محمود حسن", job: "موظف استقبال", phone: "01044444444", department: "الاستقبال", status: "على رأس العمل" },
        { id: 2, name: "آية محمد", job: "ممرضة", phone: "01055555555", department: "التمريض", status: "على رأس العمل" }
    ],

    appointments: [
        { id: 1, patient: "أحمد محمد", doctor: "د. أحمد حسن", date: "2026-11-15", time: "10:00", type: "كشف", status: "مؤكد" },
        { id: 2, patient: "سارة محمود", doctor: "د. منى إبراهيم", date: "2026-11-16", time: "12:00", type: "متابعة", status: "قيد الانتظار" }
    ],

    healthUnits: [
        { id: 1, name: "الوحدة الصحية بطنطا", location: "طنطا", phone: "0401234567", manager: "أحمد حسن", status: "تعمل" },
        { id: 2, name: "الوحدة الصحية بالمحلة", location: "المحلة الكبرى", phone: "0407654321", manager: "محمد علي", status: "تعمل" },
        { id: 3, name: "الوحدة الصحية بالسنطة", location: "السنطة", phone: "0409876543", manager: "منى إبراهيم", status: "تعمل" }
    ],

    inventory: [
        { id: 1, name: "كمامات طبية", quantity: 500, unit: "قطعة", expiry: "2027-06-01", status: "متوفر" },
        { id: 2, name: "قفازات طبية", quantity: 20, unit: "علبة", expiry: "2027-01-01", status: "منخفض" },
        { id: 3, name: "أجهزة قياس الضغط", quantity: 15, unit: "جهاز", expiry: "2028-01-01", status: "متوفر" }
    ],

    services: [
        { id: 1, name: "الكشف الطبي", department: "العيادات", price: 50, status: "متاحة" },
        { id: 2, name: "قياس الضغط", department: "التمريض", price: 15, status: "متاحة" },
        { id: 3, name: "الفحوصات الطبية", department: "المعامل", price: 100, status: "متاحة" }
    ],

    departments: [
        { id: 1, name: "الباطنة", manager: "د. أحمد حسن", location: "الطابق الأول", status: "نشط" },
        { id: 2, name: "الأطفال", manager: "د. منى إبراهيم", location: "الطابق الثاني", status: "نشط" },
        { id: 3, name: "الأسنان", manager: "د. محمد سامي", location: "الطابق الأول", status: "نشط" }
    ],

    labs: [
        { id: 1, name: "معمل التحاليل", supervisor: "محمود حسن", phone: "01066666666", status: "يعمل" },
        { id: 2, name: "معمل الأشعة", supervisor: "أحمد علي", phone: "01077777777", status: "يعمل" }
    ],

    equipment: [
        { id: 1, name: "جهاز قياس الضغط", serial: "EQ-1001", department: "الباطنة", status: "يعمل" },
        { id: 2, name: "جهاز رسم القلب", serial: "EQ-1002", department: "الطوارئ", status: "يحتاج صيانة" }
    ],

    complaints: [
        { id: 1, name: "أحمد محمد", subject: "تأخر موعد الكشف", description: "تأخر الطبيب عن الموعد المحدد", date: "2026-11-14", status: "قيد المراجعة" }
    ],

    users: [
        { id: 1, name: "نسرين محمد", username: "nesrin", role: "مدير النظام", status: "نشط" },
        { id: 2, name: "محمود حسن", username: "mahmoud", role: "موظف", status: "نشط" }
    ],

    children: [
        { id: 1, name: "ليان أحمد", birthDate: "2023-04-12", gender: "أنثى", parentName: "أحمد محمد", motherPhone: "01012345678", address: "طنطا", cardCode: "SH-CH-1001", status: "نشط" },
        { id: 2, name: "آدم محمود", birthDate: "2022-09-20", gender: "ذكر", parentName: "سارة محمود", motherPhone: "01123456789", address: "المحلة الكبرى", cardCode: "SH-CH-1002", status: "نشط" },
        { id: 3, name: "مريم علي", birthDate: "2024-01-05", gender: "أنثى", parentName: "منى علي", motherPhone: "01234567890", address: "السنطة", cardCode: "SH-CH-1003", status: "متابعة" }
    ],

    vaccinations: [
        { id: 1, childName: "ليان أحمد", vaccine: "التطعيم الثلاثي", dueDate: "2026-11-25", unit: "الوحدة الصحية بطنطا", status: "مستحق" },
        { id: 2, childName: "آدم محمود", vaccine: "شلل الأطفال", dueDate: "2026-11-28", unit: "الوحدة الصحية بالمحلة", status: "مستحق" },
        { id: 3, childName: "مريم علي", vaccine: "الحصبة", dueDate: "2026-10-10", unit: "الوحدة الصحية بالسنطة", status: "متأخر" }
    ],

    symptoms: [
        { id: 1, patientName: "Ahmed yasser", age: 8, symptom: "ارتفاع درجة الحرارة", location: "محلة مرحوم", date: "2026-11-17", severity: "متوسط" },
        { id: 2, patientName: "Islam mohamed", age: 12, symptom: "ارتفاع درجة الحرارة", location: "محلة مرحوم", date: "2026-11-18", severity: "بسيط" },
        { id: 3, patientName: "Mohamed elsayed", age: 25, symptom: "كحة", location: "طنطا", date: "2026-11-18", severity: "بسيط" },
        { id: 4, patientName: "Mazen islam", age: 6, symptom: "ارتفاع درجة الحرارة", location: "محلة مرحوم", date: "2026-11-19", severity: "متوسط" }
    ],

    growthRecords: [
        { id: 1, childName: "ليان أحمد", date: "2026-11-01", height: 92, weight: 13.5, notes: "متابعة دورية" },
        { id: 2, childName: "آدم محمود", date: "2026-11-02", height: 101, weight: 16, notes: "النمو مستقر" }
    ],

    motherNotifications: [
        { id: 1, motherName: "أحمد محمد", childName: "ليان أحمد", phone: "01012345678", message: "تذكير بموعد التطعيم القادم", date: "2026-11-24", status: "مجدول" },
        { id: 2, motherName: "سارة محمود", childName: "آدم محمود", phone: "01123456789", message: "يرجى مراجعة الوحدة الصحية لمتابعة التطعيم", date: "2026-11-27", status: "مجدول" }
    ],

    notifications: [
        { id: 1, title: "موعد طبي جديد", description: "تم إضافة موعد جديد للمريض أحمد محمد", date: "اليوم", type: "موعد" },
        { id: 2, title: "تنبيه المخزون", description: "كمية القفازات الطبية منخفضة", date: "اليوم", type: "مخزون" },
        { id: 3, title: "تحديث البيانات", description: "تم تحديث بيانات الوحدة الصحية", date: "أمس", type: "تحديث" }
    ]
};

const menuGroups = [
    { title: "الرئيسية", items: [{ id: "home", label: "لوحة التحكم", icon: "▦" }] },
    { title: "المرضى والمواعيد", items: [
        { id: "patients", label: "المرضى", icon: "♙" },
        { id: "appointments", label: "حجز المواعيد", icon: "▣" }
    ] },
    { title: "الكوادر الطبية", items: [
        { id: "doctors", label: "الأطباء", icon: "⚕" },
        { id: "employees", label: "الموظفون", icon: "♧" }
    ] },
    { title: "المنشآت والموارد", items: [
        { id: "healthUnits", label: "الوحدات الصحية", icon: "⌂" },
        { id: "inventory", label: "المخزون الطبي", icon: "▤" },
        { id: "services", label: "الخدمات الطبية", icon: "✚" },
        { id: "departments", label: "الأقسام", icon: "▥" },
        { id: "labs", label: "المعامل", icon: "⚗" },
        { id: "equipment", label: "الأجهزة الطبية", icon: "⚙" }
    ] },
    { title: "الذكاء الصحي والإنذار المبكر", items: [
        { id: "epidemicMap", label: "خريطة الانتشار الوبائي", icon: "⌖" },
        { id: "symptoms", label: "تسجيل الأعراض", icon: "✚" },
        { id: "healthAlerts", label: "الإنذارات الصحية", icon: "⚠" }
    ] },
    { title: "بوابة رعاية الطفل", items: [
        { id: "children", label: "ملفات الأطفال", icon: "♧" },
        { id: "vaccinations", label: "جدول التطعيمات", icon: "✚" },
        { id: "childCard", label: "الكارت الصحي الرقمي", icon: "▣" },
        { id: "childGrowth", label: "متابعة النمو", icon: "↗" },
        { id: "motherNotifications", label: "تنبيهات الأمهات", icon: "♢" }
    ] },
    { title: "الإدارة", items: [
        { id: "reports", label: "التقارير", icon: "▧" },
        { id: "notifications", label: "الإشعارات", icon: "♢" },
        { id: "complaints", label: "الشكاوى", icon: "☏" },
        { id: "users", label: "المستخدمون", icon: "♙" },
        { id: "settings", label: "الإعدادات", icon: "⚙" }
    ] }
];

const pageTitles = {
    home: "لوحة التحكم",
    patients: "إدارة المرضى",
    doctors: "إدارة الأطباء",
    employees: "إدارة الموظفين",
    appointments: "حجز وإدارة المواعيد",
    healthUnits: "الوحدات الصحية",
    inventory: "المخزون الطبي",
    services: "الخدمات الطبية",
    departments: "الأقسام الطبية",
    labs: "المعامل",
    equipment: "الأجهزة الطبية",
    epidemicMap: "خريطة الانتشار الوبائي",
    symptoms: "تسجيل الأعراض",
    healthAlerts: "الإنذارات الصحية",
    children: "ملفات الأطفال",
    vaccinations: "جدول التطعيمات",
    childCard: "الكارت الصحي الرقمي",
    childGrowth: "متابعة نمو الطفل",
    motherNotifications: "تنبيهات الأمهات",
    reports: "التقارير والإحصائيات",
    notifications: "الإشعارات",
    complaints: "الشكاوى",
    users: "المستخدمون",
    settings: "الإعدادات"
};

const tableConfig = {
    patients: {
        title: "قائمة المرضى",
        button: "إضافة مريض",
        fields: [
            ["name", "اسم المريض", "text"],
            ["phone", "رقم الهاتف", "tel"],
            ["age", "العمر", "number"],
            ["gender", "النوع", "select", ["ذكر", "أنثى"]],
            ["address", "العنوان", "text"],
            ["status", "الحالة", "select", ["نشط", "متابعة", "متوقف"]]
        ],
        columns: [
            ["name", "اسم المريض"],
            ["phone", "رقم الهاتف"],
            ["age", "العمر"],
            ["gender", "النوع"],
            ["address", "العنوان"],
            ["status", "الحالة"]
        ]
    },

    doctors: {
        title: "قائمة الأطباء",
        button: "إضافة طبيب",
        fields: [
            ["name", "اسم الطبيب", "text"],
            ["specialty", "التخصص", "text"],
            ["phone", "رقم الهاتف", "tel"],
            ["email", "البريد الإلكتروني", "email"],
            ["status", "الحالة", "select", ["متاح", "غير متاح"]]
        ],
        columns: [
            ["name", "اسم الطبيب"],
            ["specialty", "التخصص"],
            ["phone", "رقم الهاتف"],
            ["email", "البريد الإلكتروني"],
            ["status", "الحالة"]
        ]
    },

    employees: {
        title: "قائمة الموظفين",
        button: "إضافة موظف",
        fields: [
            ["name", "اسم الموظف", "text"],
            ["job", "المسمى الوظيفي", "text"],
            ["phone", "رقم الهاتف", "tel"],
            ["department", "القسم", "text"],
            ["status", "الحالة", "select", ["على رأس العمل", "إجازة", "متوقف"]]
        ],
        columns: [
            ["name", "اسم الموظف"],
            ["job", "الوظيفة"],
            ["phone", "رقم الهاتف"],
            ["department", "القسم"],
            ["status", "الحالة"]
        ]
    },

    appointments: {
        title: "جدول المواعيد والحجوزات",
        button: "حجز موعد جديد",
        fields: [
            ["patient", "اسم المريض", "text"],
            ["doctor", "اسم الطبيب", "text"],
            ["date", "تاريخ الحجز", "date"],
            ["time", "وقت الحجز", "time"],
            ["type", "نوع الزيارة", "select", ["كشف", "متابعة", "استشارة", "طوارئ"]],
            ["status", "حالة الحجز", "select", ["مؤكد", "قيد الانتظار", "ملغي", "مكتمل"]]
        ],
        columns: [
            ["patient", "المريض"],
            ["doctor", "الطبيب"],
            ["date", "التاريخ"],
            ["time", "الوقت"],
            ["type", "نوع الزيارة"],
            ["status", "حالة الحجز"]
        ]
    },

    healthUnits: {
        title: "قائمة الوحدات الصحية",
        button: "إضافة وحدة صحية",
        fields: [
            ["name", "اسم الوحدة", "text"],
            ["location", "الموقع", "text"],
            ["phone", "رقم الهاتف", "tel"],
            ["manager", "مدير الوحدة", "text"],
            ["status", "الحالة", "select", ["تعمل", "متوقفة"]]
        ],
        columns: [
            ["name", "اسم الوحدة"],
            ["location", "الموقع"],
            ["phone", "رقم الهاتف"],
            ["manager", "مدير الوحدة"],
            ["status", "الحالة"]
        ]
    },

    inventory: {
        title: "إدارة المخزون الطبي",
        button: "إضافة صنف",
        fields: [
            ["name", "اسم الصنف", "text"],
            ["quantity", "الكمية", "number"],
            ["unit", "وحدة القياس", "text"],
            ["expiry", "تاريخ الصلاحية", "date"],
            ["status", "الحالة", "select", ["متوفر", "منخفض", "غير متوفر"]]
        ],
        columns: [
            ["name", "اسم الصنف"],
            ["quantity", "الكمية"],
            ["unit", "وحدة القياس"],
            ["expiry", "تاريخ الصلاحية"],
            ["status", "الحالة"]
        ]
    },

    services: {
        title: "الخدمات الطبية",
        button: "إضافة خدمة",
        fields: [
            ["name", "اسم الخدمة", "text"],
            ["department", "القسم", "text"],
            ["price", "السعر", "number"],
            ["status", "الحالة", "select", ["متاحة", "غير متاحة"]]
        ],
        columns: [
            ["name", "الخدمة"],
            ["department", "القسم"],
            ["price", "السعر"],
            ["status", "الحالة"]
        ]
    },

    departments: {
        title: "الأقسام الطبية",
        button: "إضافة قسم",
        fields: [
            ["name", "اسم القسم", "text"],
            ["manager", "رئيس القسم", "text"],
            ["location", "الموقع", "text"],
            ["status", "الحالة", "select", ["نشط", "غير نشط"]]
        ],
        columns: [
            ["name", "اسم القسم"],
            ["manager", "رئيس القسم"],
            ["location", "الموقع"],
            ["status", "الحالة"]
        ]
    },

    labs: {
        title: "المعامل الطبية",
        button: "إضافة معمل",
        fields: [
            ["name", "اسم المعمل", "text"],
            ["supervisor", "المسؤول", "text"],
            ["phone", "رقم الهاتف", "tel"],
            ["status", "الحالة", "select", ["يعمل", "متوقف"]]
        ],
        columns: [
            ["name", "اسم المعمل"],
            ["supervisor", "المسؤول"],
            ["phone", "رقم الهاتف"],
            ["status", "الحالة"]
        ]
    },

    equipment: {
        title: "الأجهزة الطبية",
        button: "إضافة جهاز",
        fields: [
            ["name", "اسم الجهاز", "text"],
            ["serial", "الرقم التعريفي", "text"],
            ["department", "القسم", "text"],
            ["status", "الحالة", "select", ["يعمل", "يحتاج صيانة", "خارج الخدمة"]]
        ],
        columns: [
            ["name", "اسم الجهاز"],
            ["serial", "الرقم التعريفي"],
            ["department", "القسم"],
            ["status", "الحالة"]
        ]
    },

    children: {
        title: "ملفات الأطفال المسجلين",
        button: "إضافة طفل",
        fields: [
            ["name", "اسم الطفل", "text"],
            ["birthDate", "تاريخ الميلاد", "date"],
            ["gender", "النوع", "select", ["ذكر", "أنثى"]],
            ["parentName", "اسم ولي الأمر", "text"],
            ["motherPhone", "رقم هاتف ولي الأمر", "tel"],
            ["address", "العنوان", "text"],
            ["cardCode", "كود الكارت الصحي", "text"],
            ["status", "الحالة", "select", ["نشط", "متابعة"]]
        ],
        columns: [
            ["name", "اسم الطفل"], ["birthDate", "تاريخ الميلاد"], ["gender", "النوع"],
            ["parentName", "ولي الأمر"], ["motherPhone", "رقم الهاتف"], ["address", "المنطقة"], ["status", "الحالة"]
        ]
    },

    vaccinations: {
        title: "سجل التطعيمات ومواعيدها",
        button: "إضافة تطعيم",
        fields: [
            ["childName", "اسم الطفل", "text"],
            ["vaccine", "اسم التطعيم", "text"],
            ["dueDate", "تاريخ التطعيم", "date"],
            ["unit", "الوحدة الصحية", "text"],
            ["status", "الحالة", "select", ["مستحق", "تم", "متأخر"]]
        ],
        columns: [
            ["childName", "اسم الطفل"], ["vaccine", "التطعيم"], ["dueDate", "التاريخ"],
            ["unit", "الوحدة الصحية"], ["status", "الحالة"]
        ]
    },

    symptoms: {
        title: "سجل الأعراض والحالات الصحية",
        button: "تسجيل حالة",
        fields: [
            ["patientName", "اسم الحالة أو كودها", "text"],
            ["age", "العمر", "number"],
            ["symptom", "العرض الرئيسي", "select", ["ارتفاع درجة الحرارة", "كحة", "إسهال", "قيء", "طفح جلدي", "صعوبة تنفس", "أعراض أخرى"]],
            ["location", "القرية أو المنطقة", "text"],
            ["date", "تاريخ التسجيل", "date"],
            ["severity", "درجة الحالة", "select", ["بسيط", "متوسط", "شديد"]]
        ],
        columns: [
            ["patientName", "الحالة"], ["age", "العمر"], ["symptom", "العرض"],
            ["location", "المنطقة"], ["date", "التاريخ"], ["severity", "الحدة"]
        ]
    },

    complaints: {
        title: "شكاوى المرضى",
        button: "إضافة شكوى",
        fields: [
            ["name", "اسم مقدم الشكوى", "text"],
            ["subject", "موضوع الشكوى", "text"],
            ["description", "تفاصيل الشكوى", "text"],
            ["date", "تاريخ الشكوى", "date"],
            ["status", "حالة الشكوى", "select", ["قيد المراجعة", "تم الحل", "مرفوضة"]]
        ],
        columns: [
            ["name", "مقدم الشكوى"],
            ["subject", "الموضوع"],
            ["description", "التفاصيل"],
            ["date", "التاريخ"],
            ["status", "الحالة"]
        ]
    },

    users: {
        title: "مستخدمو النظام",
        button: "إضافة مستخدم",
        fields: [
            ["name", "اسم المستخدم", "text"],
            ["username", "اسم الدخول", "text"],
            ["role", "الصلاحية", "select", ["مدير النظام", "طبيب", "موظف", "استقبال"]],
            ["status", "الحالة", "select", ["نشط", "موقوف"]]
        ],
        columns: [
            ["name", "الاسم"],
            ["username", "اسم الدخول"],
            ["role", "الصلاحية"],
            ["status", "الحالة"]
        ]
    }
};

export default function Dashboard() {
    const navigate = useNavigate();

    const [activePage, setActivePage] = useState("home");
    const [data, setData] = useState(initialData);
    const [search, setSearch] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [toast, setToast] = useState("");
    const [theme, setTheme] = useState(() => localStorage.getItem("sh_theme") || "light");
    const [selectedChildId, setSelectedChildId] = useState(initialData.children[0]?.id || "");
    const [growthForm, setGrowthForm] = useState({
        childName: "",
        date: new Date().toISOString().slice(0, 10),
        height: "",
        weight: "",
        notes: ""
    });

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(""), 3000);
    };

    const logout = () => {
        sessionStorage.removeItem("sh_session");
        localStorage.removeItem("sh_session");
        navigate("/login");
    };

    const navigatePage = (page) => {
        setActivePage(page);
        setSearch("");
        setSidebarOpen(false);
    };

    const openAddDialog = () => {
        setEditingId(null);
        setFormData(activePage === "children" ? {
            cardCode: `SH-CH-${Date.now()}`,
            status: "نشط"
        } : {});
        setDialogOpen(true);
    };

    const openEditDialog = (item) => {
        setEditingId(item.id);
        setFormData({ ...item });
        setDialogOpen(true);
    };

    const saveRecord = (e) => {
        e.preventDefault();

        const currentData = data[activePage] || [];

        if (editingId !== null) {
            setData(previous => ({
                ...previous,
                [activePage]: currentData.map(item =>
                    item.id === editingId
                        ? { ...formData, id: editingId }
                        : item
                )
            }));

            showToast("تم تعديل البيانات بنجاح");
        } else {
            const newRecord = {
                ...formData,
                id: Date.now()
            };

            setData(previous => ({
                ...previous,
                [activePage]: [...(previous[activePage] || []), newRecord]
            }));

            showToast("تمت إضافة البيانات بنجاح");

            if (activePage === "symptoms") {
                setData(previous => ({
                    ...previous,
                    notifications: [
                        {
                            id: Date.now() + 2,
                            title: "تسجيل حالة صحية",
                            description: `تم تسجيل عرض ${formData.symptom} في ${formData.location}`,
                            date: "اليوم",
                            type: "صحة"
                        },
                        ...previous.notifications
                    ]
                }));
            }

            if (activePage === "vaccinations") {
                const childRecord = data.children.find(child => child.name === formData.childName);

                setData(previous => ({
                    ...previous,
                    motherNotifications: [{
                        id: Date.now() + 3,
                        motherName: childRecord?.parentName || "ولي الأمر",
                        childName: formData.childName,
                        phone: childRecord?.motherPhone || "غير مسجل",
                        message: `تذكير بموعد ${formData.vaccine}`,
                        date: formData.dueDate,
                        status: "مجدول"
                    }, ...previous.motherNotifications]
                }));
            }

            if (activePage === "appointments") {
                setData(previous => ({
                    ...previous,
                    notifications: [
                        {
                            id: Date.now() + 1,
                            title: "حجز موعد جديد",
                            description: `تم تسجيل موعد للمريض ${formData.patient}`,
                            date: "اليوم",
                            type: "موعد"
                        },
                        ...previous.notifications
                    ]
                }));
            }
        }

        setDialogOpen(false);
        setFormData({});
        setEditingId(null);
    };

    const deleteRecord = (id) => {
        const confirmed = window.confirm("هل أنت متأكد من حذف هذا السجل؟");

        if (!confirmed) return;

        setData(previous => ({
            ...previous,
            [activePage]: previous[activePage].filter(item => item.id !== id)
        }));

        showToast("تم حذف السجل بنجاح");
    };

    const getFilteredData = () => {
        const records = data[activePage] || [];

        return records.filter(item =>
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(search.toLowerCase())
            )
        );
    };

    const renderSidebar = () => (
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`} id="sidebar">
            <div className="brand">
                <svg width="34" height="34" viewBox="0 0 30 30">
                    <rect width="30" height="30" rx="7" fill="#e6f1ef" />
                    <path d="M12.5 6h5v6.5H24v5h-6.5V24h-5v-6.5H6v-5h6.5z" fill="#0d3532" />
                </svg>
                <div>
                    <strong>Smart Health</strong>
                    <span>نظام المعلومات الصحي الذكي</span>
                </div>
            </div>

            <nav>
                {menuGroups.map((group, index) => (
                    <div className="nav-group" key={index}>
                        <p className="nav-title">{group.title}</p>
                        {group.items.map(item => (
                            <button
                                type="button"
                                key={item.id}
                                className={activePage === item.id ? "active" : ""}
                                onClick={() => navigatePage(item.id)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {item.label}
                            </button>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="side-foot">
                <div className="who">
                    <strong>نسرين محمد</strong>
                    <span>مدير النظام</span>
                </div>
                <button type="button" className="btn-side" onClick={logout}>
                    تسجيل الخروج
                </button>
            </div>
        </aside>
    );

    const getEpidemicGroups = () => {
        const groups = {};

        (data.symptoms || []).forEach(item => {
            const key = `${item.location}__${item.symptom}`;

            if (!groups[key]) {
                groups[key] = {
                    key,
                    location: item.location,
                    symptom: item.symptom,
                    count: 0,
                    cases: []
                };
            }

            groups[key].count += 1;
            groups[key].cases.push(item);
        });

        return Object.values(groups).map(group => ({
            ...group,
            level: group.count >= 5 ? "مرتفع" : group.count >= 3 ? "متابعة" : "مستقر"
        })).sort((a, b) => b.count - a.count);
    };

    const renderHome = () => (
        <div className="dashboard-content">
            <div className="welcome-section">
                <div>
                    <h1>مرحباً بك، نسرين محمد</h1>
                    <p>إليك نظرة عامة على النظام الصحي اليوم.</p>
                </div>
                <span className="welcome-date">
                    {new Date().toLocaleDateString("ar-EG", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    })}
                </span>
            </div>

            <div className="stats-grid">
                <div className="stat-card"><div className="stat-icon green">♙</div><div><span>إجمالي المرضى</span><h2>{data.patients.length + 1247}</h2><small>إجمالي المسجلين بالنظام</small></div></div>
                <div className="stat-card"><div className="stat-icon blue">⚕</div><div><span>الأطباء</span><h2>{data.doctors.length + 82}</h2><small>إجمالي الكوادر الطبية</small></div></div>
                <div className="stat-card"><div className="stat-icon orange">⌂</div><div><span>الوحدات الصحية</span><h2>{data.healthUnits.length + 21}</h2><small>الوحدات المسجلة</small></div></div>
                <div className="stat-card"><div className="stat-icon purple">▣</div><div><span>المواعيد</span><h2>{data.appointments.length + 154}</h2><small>المواعيد المسجلة</small></div></div>
                <div className="stat-card"><div className="stat-icon blue">♧</div><div><span>الأطفال المسجلون</span><h2>{data.children.length}</h2><small>ملفات الأطفال المسجلة</small></div></div>
                <div className="stat-card"><div className="stat-icon green">✚</div><div><span>التطعيمات المستحقة</span><h2>{data.vaccinations.filter(item => item.status === "مستحق" || item.status === "متأخر").length}</h2><small>تحتاج إلى متابعة</small></div></div>
            </div>

            <section className="smart-overview">
                <div className="smart-section-heading">
                    <div>
                        <h2>مركز الذكاء الصحي</h2>
                        <p>متابعة المؤشرات الصحية والإنذار المبكر ورعاية الطفل</p>
                    </div>
                    <span className="smart-status">نظرة عامة</span>
                </div>

                <div className="feature-panels">
                    <article className="feature-panel">
                        <div className="feature-heading">
                            <div>
                                <span className="feature-icon">⌖</span>
                                <div>
                                    <h3>مؤشرات الانتشار الوبائي</h3>
                                    <p>متابعة تركز الأعراض المتشابهة حسب المنطقة</p>
                                </div>
                            </div>
                            
                        </div>

                        <div className="epidemic-summary">
                            <div className="epidemic-number">
                                <strong>{new Set(data.symptoms.map(item => item.location)).size}</strong>
                                <span>مناطق مسجلة</span>
                            </div>
                            <div className="epidemic-number">
                                <strong>{getEpidemicGroups().filter(item => item.level !== "مستقر").length}</strong>
                                <span>تحتاج مراجعة</span>
                            </div>
                            <div className="epidemic-number">
                                <strong>{getEpidemicGroups().filter(item => item.level === "مرتفع").length}</strong>
                                <span>تنبيهات مرتفعة</span>
                            </div>
                        </div>

                        <div className="village-list">
                            {getEpidemicGroups().slice(0, 3).map(item => (
                                <div className="village-item" key={item.key}>
                                    <span className={`village-indicator ${item.level === "مرتفع" ? "danger" : item.level === "متابعة" ? "warning" : "safe"}`}></span>
                                    <span>{item.location} - {item.symptom}</span>
                                    <strong>{item.level}</strong>
                                </div>
                            ))}
                        </div>

                    
                        <button className="feature-action" onClick={() => navigatePage("epidemicMap")}>فتح خريطة الانتشار</button>
                    </article>

                    <article className="feature-panel">
                        <div className="feature-heading">
                            <div>
                                <span className="feature-icon">♧</span>
                                <div>
                                    <h3>بوابة رعاية الطفل</h3>
                                    <p>متابعة التطعيمات والنمو والسجل الصحي</p>
                                </div>
                            </div>
                            
                        </div>

                        <div className="child-summary">
                            <div><strong>{data.children.length}</strong><span>طفل مسجل</span></div>
                            <div><strong>{data.vaccinations.filter(item => item.status === "مستحق").length}</strong><span>تطعيم مستحق</span></div>
                            <div><strong>{data.vaccinations.filter(item => item.status === "متأخر").length}</strong><span>تطعيم متأخر</span></div>
                        </div>

                        <div className="child-message">
                            <strong>متابعة صحة طفلك تبدأ من هنا</strong>
                            <p>ملف صحي موحد لمتابعة مواعيد التطعيمات وقياسات النمو.</p>
                        </div>
                        <button className="feature-action" onClick={() => navigatePage("vaccinations")}>عرض جدول التطعيمات</button>
                    </article>
                </div>
            </section>

            <section className="content-card quick-access-card">
                <div className="section-heading">
                    <div>
                        <h2>الوصول السريع</h2>
                        <p>الأقسام الرئيسية للمميزات الذكية</p>
                    </div>
                </div>
                <div className="quick-access-grid">
                    <button onClick={() => navigatePage("epidemicMap")}>خريطة الانتشار الوبائي</button>
                    <button onClick={() => navigatePage("symptoms")}>تسجيل الأعراض</button>
                    <button onClick={() => navigatePage("healthAlerts")}>الإنذارات الصحية</button>
                    <button onClick={() => navigatePage("children")}>ملفات الأطفال</button>
                    <button onClick={() => navigatePage("vaccinations")}>التطعيمات</button>
                    <button onClick={() => navigatePage("childGrowth")}>متابعة النمو</button>
                </div>
            </section>

            <div className="content-grid">
                <section className="content-card">
                    <div className="section-heading">
                        <div><h2>آخر المرضى المسجلين</h2><p>أحدث بيانات المرضى في النظام</p></div>
                        <button className="text-button" onClick={() => navigatePage("patients")}>عرض الكل</button>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr><th>اسم المريض</th><th>رقم الهاتف</th><th>العمر</th><th>الحالة</th></tr>
                            </thead>
                            <tbody>
                                {data.patients.slice(0, 5).map(patient => (
                                    <tr key={patient.id}>
                                        <td>{patient.name}</td>
                                        <td>{patient.phone}</td>
                                        <td>{patient.age}</td>
                                        <td><span className="status-badge success">{patient.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="content-card">
                    <div className="section-heading">
                        <div><h2>الإشعارات الأخيرة</h2><p>آخر التحديثات في النظام</p></div>
                        <button className="text-button" onClick={() => navigatePage("notifications")}>عرض الكل</button>
                    </div>
                    <div className="notification-list">
                        {data.notifications.slice(0, 5).map(notification => (
                            <div className="notification-item" key={notification.id}>
                                <span className="notification-dot"></span>
                                <div>
                                    <strong>{notification.title}</strong>
                                    <p>{notification.description}</p>
                                    <small>{notification.date}</small>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <section className="content-card">
                <div className="section-heading">
                    <div><h2>المواعيد القادمة</h2><p>متابعة الحجوزات المسجلة بالنظام</p></div>
                    <button className="text-button" onClick={() => navigatePage("appointments")}>إدارة المواعيد</button>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>المريض</th><th>الطبيب</th><th>التاريخ</th><th>الوقت</th><th>الحالة</th></tr>
                        </thead>
                        <tbody>
                            {data.appointments.slice(0, 5).map(item => (
                                <tr key={item.id}>
                                    <td>{item.patient}</td>
                                    <td>{item.doctor}</td>
                                    <td>{item.date}</td>
                                    <td>{item.time}</td>
                                    <td><span className="status-badge">{item.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );

    const renderTable = () => {
        const config = tableConfig[activePage];

        if (!config) return renderComingSoon();

        const records = getFilteredData();

        return (
            <section className="page-content">
                <div className="page-heading">
                    <div>
                        <h1>{pageTitles[activePage]}</h1>
                        <p>إدارة ومتابعة البيانات الخاصة بالقسم.</p>
                    </div>
                    <button className="add-button" onClick={openAddDialog}>
                        + {config.button}
                    </button>
                </div>

                <div className="content-card">
                    <div className="table-toolbar">
                        <h2>{config.title}</h2>
                        <input
                            type="search"
                            placeholder="ابحث في السجلات..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>م</th>
                                    {config.columns.map(column => (
                                        <th key={column[0]}>{column[1]}</th>
                                    ))}
                                    <th>الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.length > 0 ? records.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        {config.columns.map(column => (
                                            <td key={column[0]}>
                                                {column[0] === "status" ? (
                                                    <span className="status-badge">{item[column[0]]}</span>
                                                ) : item[column[0]]}
                                            </td>
                                        ))}
                                        <td>
                                            <div className="actions">
                                                <button className="edit-button" onClick={() => openEditDialog(item)}>تعديل</button>
                                                <button className="delete-button" onClick={() => deleteRecord(item.id)}>حذف</button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={config.columns.length + 2}>لا توجد بيانات لعرضها</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="table-footer">إجمالي السجلات: {records.length}</div>
                </div>
            </section>
        );
    };

    const renderNotifications = () => (
        <section className="page-content">
            <div className="page-heading">
                <div>
                    <h1>الإشعارات</h1>
                    <p>متابعة جميع التنبيهات والتحديثات.</p>
                </div>
            </div>
            <div className="content-card">
                {data.notifications.map(item => (
                    <div className="notification-item" key={item.id}>
                        <span className="notification-dot"></span>
                        <div>
                            <strong>{item.title}</strong>
                            <p>{item.description}</p>
                            <small>{item.date}</small>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );

    const renderReports = () => (
        <section className="page-content">
            <div className="page-heading">
                <div>
                    <h1>التقارير والإحصائيات</h1>
                    <p>ملخص شامل لبيانات النظام الصحي.</p>
                </div>
            </div>

            <div className="stats-grid">
                {[
                    ["المرضى", data.patients.length + 1247],
                    ["الأطباء", data.doctors.length + 82],
                    ["الموظفون", data.employees.length],
                    ["المواعيد", data.appointments.length + 154],
                    ["الوحدات الصحية", data.healthUnits.length + 21],
                    ["الأجهزة الطبية", data.equipment.length]
                ].map((item, index) => (
                    <div className="stat-card" key={index}>
                        <div><span>{item[0]}</span><h2>{item[1]}</h2></div>
                    </div>
                ))}
            </div>

            <div className="content-card">
                <div className="section-heading">
                    <div><h2>ملخص حالة المخزون</h2><p>مراجعة الأصناف التي تحتاج إلى متابعة</p></div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>الصنف</th><th>الكمية</th><th>وحدة القياس</th><th>الحالة</th></tr>
                        </thead>
                        <tbody>
                            {data.inventory.map(item => (
                                <tr key={item.id}>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.unit}</td>
                                    <td><span className="status-badge">{item.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );

    const renderSettings = () => (
        <section className="page-content">
            <div className="page-heading">
                <div><h1>الإعدادات</h1><p>التحكم في تفضيلات النظام.</p></div>
            </div>

            <div className="content-card settings-card">
                <h2>إعدادات المظهر</h2>
                <div className="setting-row">
                    <div><strong>المظهر العام</strong></div>
                    <select
                        value={theme}
                        onChange={e => {
                            setTheme(e.target.value);
                            localStorage.setItem("sh_theme", e.target.value);
                        }}
                    >
                        <option value="light">فاتح</option>
                        <option value="dark">داكن</option>
                    </select>
                </div>
                <button className="add-button" onClick={() => showToast("تم تطبيق المظهر")}>
                    حفظ الإعدادات
                </button>
            </div>
        </section>
    );

    const renderEpidemicMap = () => {
        const groups = getEpidemicGroups();
        const locations = [...new Set((data.symptoms || []).map(item => item.location))];

        return (
            <section className="page-content">
                <div className="page-heading">
                    <div>
                        <h1>خريطة متابعة الانتشار الوبائي</h1>
                        <p>رصد تجمعات الأعراض المتشابهة حسب المنطقة وتاريخ تسجيل الحالة.</p>
                    </div>
                    <button className="add-button" onClick={() => navigatePage("symptoms")}>+ تسجيل حالة جديدة</button>
                </div>

                <div className="stats-grid">
                    <div className="stat-card"><div className="stat-icon green">⌖</div><div><span>المناطق المسجلة</span><h2>{locations.length}</h2><small>حسب بيانات الحالات</small></div></div>
                    <div className="stat-card"><div className="stat-icon orange">♧</div><div><span>إجمالي الحالات</span><h2>{data.symptoms.length}</h2><small>سجلات الأعراض المدخلة</small></div></div>
                    <div className="stat-card"><div className="stat-icon purple">⚠</div><div><span>مناطق تحتاج مراجعة</span><h2>{groups.filter(item => item.level !== "مستقر").length}</h2><small>وفق حدود التنبيه التجريبية</small></div></div>
                </div>

                <div className="content-card">
                    <div className="section-heading">
                        <div><h2>مؤشرات المناطق</h2><p>كل بطاقة تعرض عدد الحالات المسجلة للعرض أو العرض الصحي المحدد في المنطقة.</p></div>
                        <span className="smart-status">تحديث حسب السجلات</span>
                    </div>

                    <div className="feature-panels">
                        {groups.length ? groups.map(group => (
                            <article className="feature-panel" key={group.key}>
                                <div className="feature-heading">
                                    <div>
                                        <span className="feature-icon">⌖</span>
                                        <div><h3>{group.location}</h3><p>{group.symptom}</p></div>
                                    </div>
                                    <span className={`feature-tag ${group.level === "مرتفع" ? "danger" : group.level === "متابعة" ? "warning" : "safe"}`}>{group.level}</span>
                                </div>

                                <div className="epidemic-summary">
                                    <div className="epidemic-number"><strong>{group.count}</strong><span>حالة مسجلة</span></div>
                                    <div className="epidemic-number"><strong>{group.cases.filter(item => item.severity === "شديد").length}</strong><span>حالات شديدة</span></div>
                                    <div className="epidemic-number"><strong>{group.cases[0]?.date || "—"}</strong><span>آخر تسجيل</span></div>
                                </div>

                                <button className="feature-action" onClick={() => {
                                    setSearch(group.location);
                                    setActivePage("symptoms");
                                }}>
                                    عرض الحالات المسجلة
                                </button>
                            </article>
                        )) : <p>لا توجد حالات مسجلة حتى الآن. ابدأ بتسجيل الأعراض لعرض المؤشرات.</p>}
                    </div>
                </div>

                <div className="content-card">
                    <div className="section-heading">
                        <div><h2>سجل الحالات</h2><p>البيانات التي تم إدخالها في النظام</p></div>
                        <button className="text-button" onClick={() => navigatePage("symptoms")}>إدارة سجل الأعراض</button>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr><th>الحالة</th><th>العرض</th><th>المنطقة</th><th>التاريخ</th><th>الحدة</th></tr>
                            </thead>
                            <tbody>
                                {data.symptoms.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.patientName}</td>
                                        <td>{item.symptom}</td>
                                        <td>{item.location}</td>
                                        <td>{item.date}</td>
                                        <td><span className="status-badge">{item.severity}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                
            </section>
        );
    };

    const renderHealthAlerts = () => {
        const alerts = getEpidemicGroups().filter(item => item.level !== "مستقر");

        return (
            <section className="page-content">
                <div className="page-heading">
                    <div><h1>الإنذارات الصحية</h1><p>تنبيهات مشتقة من تكرار الأعراض في المناطق المسجلة.</p></div>
                    <button className="add-button" onClick={() => navigatePage("symptoms")}>تسجيل حالة</button>
                </div>

                <div className="content-card">
                    {alerts.length ? alerts.map(item => (
                        <div className="notification-item" key={item.key}>
                            <span className="notification-dot"></span>
                            <div>
                                <strong>{item.level === "مرتفع" ? "تنبيه يتطلب مراجعة" : "مؤشر يحتاج متابعة"} - {item.location}</strong>
                                <p>تم تسجيل {item.count} حالات مرتبطة بعرض: {item.symptom}.</p>
                                <small>عدد السجلات الحالي: {item.count}</small>
                            </div>
                        </div>
                    )) : (
                        <div className="empty-section">
                            <div className="empty-icon">✓</div>
                            <h2>لا توجد إنذارات حالية</h2>
                            <p>لا توجد تجمعات تجاوزت حدود المتابعة التجريبية.</p>
                        </div>
                    )}
                </div>

                <p className="feature-note">هذه التنبيهات مؤشرات فرز أولي وليست تشخيصًا أو إعلانًا عن وباء.</p>
            </section>
        );
    };

    const renderChildCard = () => {
        const child = data.children.find(item => String(item.id) === String(selectedChildId)) || data.children[0];

        return (
            <section className="page-content">
                <div className="page-heading">
                    <div><h1>الكارت الصحي الرقمي للطفل</h1><p>بطاقة تعريف مختصرة للوصول إلى الملف الصحي داخل النظام.</p></div>
                    <button className="add-button" onClick={() => navigatePage("children")}>إدارة ملفات الأطفال</button>
                </div>

                <div className="content-card">
                    <div className="table-toolbar">
                        <h2>اختيار الطفل</h2>
                        <select value={child?.id || ""} onChange={e => setSelectedChildId(e.target.value)}>
                            {data.children.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                    </div>

                    {child ? (
                        <div className="child-card-preview">
                            <div>
                                <span className="smart-status">SMART HEALTH</span>
                                <h2>{child.name}</h2>
                                <p>الكود الصحي: <strong>{child.cardCode || `SH-CH-${child.id}`}</strong></p>
                                <p>تاريخ الميلاد: {child.birthDate}</p>
                                <p>ولي الأمر: {child.parentName}</p>
                                <p>رقم التواصل: {child.motherPhone}</p>
                                <p>العنوان: {child.address}</p>
                                <p>الحالة: {child.status}</p>
                                <button className="add-button" onClick={() => window.print()}>طباعة الكارت</button>
                            </div>
                            <div className="qr-card">
                                <img
                                    alt="QR للكود التعريفي فقط"
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(child.cardCode || `SH-CH-${child.id}`)}`}
                                />
                                <small>يمثل الرمز كود الطفل فقط ولا يحتوي على بياناته الصحية.</small>
                            </div>
                        </div>
                    ) : <p>لا توجد ملفات أطفال. أضف طفلًا أولًا لإنشاء الكارت.</p>}
                </div>
            </section>
        );
    };

    const renderChildGrowth = () => (
        <section className="page-content">
            <div className="page-heading">
                <div><h1>متابعة نمو الطفل</h1><p>تسجيل قياسات الطول والوزن ومراجعة سجل المتابعة.</p></div>
            </div>

            <div className="content-card">
                <div className="section-heading">
                    <div><h2>إضافة قياس جديد</h2><p>أدخل القياسات المسجلة في الزيارة الحالية.</p></div>
                </div>

                <form onSubmit={e => {
                    e.preventDefault();
                    setData(previous => ({
                        ...previous,
                        growthRecords: [...previous.growthRecords, { ...growthForm, id: Date.now() }]
                    }));
                    setGrowthForm({
                        childName: "",
                        date: new Date().toISOString().slice(0, 10),
                        height: "",
                        weight: "",
                        notes: ""
                    });
                    showToast("تم حفظ قياسات النمو");
                }}>
                    <div className="fields">
                        <div className="input-group">
                            <label>اسم الطفل</label>
                            <select required value={growthForm.childName} onChange={e => setGrowthForm(previous => ({ ...previous, childName: e.target.value }))}>
                                <option value="">اختر الطفل</option>
                                {data.children.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                            </select>
                        </div>

                        <div className="input-group">
                            <label>تاريخ القياس</label>
                            <input type="date" required value={growthForm.date} onChange={e => setGrowthForm(previous => ({ ...previous, date: e.target.value }))} />
                        </div>

                        <div className="input-group">
                            <label>الطول (سم)</label>
                            <input type="number" min="0" step="0.1" required value={growthForm.height} onChange={e => setGrowthForm(previous => ({ ...previous, height: e.target.value }))} />
                        </div>

                        <div className="input-group">
                            <label>الوزن (كجم)</label>
                            <input type="number" min="0" step="0.1" required value={growthForm.weight} onChange={e => setGrowthForm(previous => ({ ...previous, weight: e.target.value }))} />
                        </div>

                        <div className="input-group">
                            <label>ملاحظات</label>
                            <input value={growthForm.notes} onChange={e => setGrowthForm(previous => ({ ...previous, notes: e.target.value }))} />
                        </div>
                    </div>

                    <div className="dialog-foot">
                        <button type="submit" className="add-button">حفظ القياسات</button>
                    </div>
                </form>
            </div>

            <div className="content-card">
                <div className="section-heading">
                    <div><h2>سجل قياسات النمو</h2><p>القياسات المسجلة لكل طفل.</p></div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr><th>الطفل</th><th>التاريخ</th><th>الطول (سم)</th><th>الوزن (كجم)</th><th>ملاحظات</th></tr>
                        </thead>
                        <tbody>
                            {data.growthRecords.map(item => (
                                <tr key={item.id}>
                                    <td>{item.childName}</td>
                                    <td>{item.date}</td>
                                    <td>{item.height}</td>
                                    <td>{item.weight}</td>
                                    <td>{item.notes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <p className="feature-note">تسجيل القياسات لا يقدم تشخيصًا تلقائيًا؛ تقييم النمو ومقارنة القياسات بالمخططات المرجعية يتم بواسطة المختص الصحي.</p>
        </section>
    );

    const renderMotherNotifications = () => {
        const dueVaccines = data.vaccinations.filter(item => item.status === "مستحق" || item.status === "متأخر");

        return (
            <section className="page-content">
                <div className="page-heading">
                    <div><h1>تنبيهات الأمهات وأولياء الأمور</h1><p>قائمة تذكيرات التطعيم والمتابعة المرتبطة بملفات الأطفال.</p></div>
                    <button className="add-button" onClick={() => navigatePage("vaccinations")}>إدارة التطعيمات</button>
                </div>

                <div className="stats-grid">
                    <div className="stat-card"><div className="stat-icon blue">♢</div><div><span>التذكيرات المسجلة</span><h2>{data.motherNotifications.length}</h2></div></div>
                    <div className="stat-card"><div className="stat-icon orange">✚</div><div><span>تطعيمات تحتاج متابعة</span><h2>{dueVaccines.length}</h2></div></div>
                </div>

                <div className="content-card">
                    <div className="section-heading">
                        <div><h2>التذكيرات المسجلة</h2></div>
                    </div>
                    {data.motherNotifications.map(item => (
                        <div className="notification-item" key={item.id}>
                            <span className="notification-dot"></span>
                            <div>
                                <strong>{item.childName} - {item.motherName}</strong>
                                <p>{item.message}</p>
                                <small>{item.date} · {item.phone} · {item.status}</small>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="content-card">
                    <div className="section-heading">
                        <div><h2>تطعيمات تحتاج تذكيرًا</h2><p>مواعيد مستحقة أو متأخرة من جدول التطعيمات</p></div>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr><th>الطفل</th><th>التطعيم</th><th>التاريخ</th><th>الوحدة</th><th>الحالة</th></tr>
                            </thead>
                            <tbody>
                                {dueVaccines.map(item => (
                                    <tr key={item.id}>
                                        <td>{item.childName}</td>
                                        <td>{item.vaccine}</td>
                                        <td>{item.dueDate}</td>
                                        <td>{item.unit}</td>
                                        <td>{item.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                إرسال رسائ
            </section>
        );
    };

    const renderComingSoon = () => (
        <section className="page-content">
            <div className="page-heading">
                <div>
                    <h1>{pageTitles[activePage] || "قسم جديد"}</h1>
                    <p>إدارة ومتابعة {pageTitles[activePage] || "هذا القسم"} داخل النظام.</p>
                </div>
            </div>
            <div className="content-card empty-section">
                <div className="empty-icon">✚</div>
                <h2>{pageTitles[activePage]}</h2>
                
            </div>
        </section>
    );

    const renderContent = () => {
        if (activePage === "home") return renderHome();
        if (activePage === "notifications") return renderNotifications();
        if (activePage === "reports") return renderReports();
        if (activePage === "settings") return renderSettings();
        if (activePage === "epidemicMap") return renderEpidemicMap();
        if (activePage === "healthAlerts") return renderHealthAlerts();
        if (activePage === "childCard") return renderChildCard();
        if (activePage === "childGrowth") return renderChildGrowth();
        if (activePage === "motherNotifications") return renderMotherNotifications();
        if (tableConfig[activePage]) return renderTable();
        return renderComingSoon();
    };

    return (
        <div className={`app ${theme === "dark" ? "dark-mode" : ""}`}>
            {renderSidebar()}

            {sidebarOpen && (
                <div className="scrim" onClick={() => setSidebarOpen(false)}></div>
            )}

            <div className="main-col">
                <header className="topbar">
                    <button
                        type="button"
                        className="menu-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        aria-label="القائمة"
                    >
                        ☰
                    </button>

                    <span className="today">
                        {new Date().toLocaleDateString("ar-EG", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        })}
                    </span>

                    <div className="top-actions">
                        <input
                            type="search"
                            className="global-search"
                            placeholder="بحث في السجلات..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />

                        <button className="btn btn-quiet" onClick={() => navigatePage("notifications")}>
                            الإشعارات
                            <span className="count">{data.notifications.length}</span>
                        </button>
                    </div>
                </header>

                <main id="main">
                    {renderContent()}
                </main>
            </div>

            {dialogOpen && (
                <div className="modal-overlay" onClick={() => setDialogOpen(false)}>
                    <div className="custom-modal" onClick={e => e.stopPropagation()}>
                        <div className="dialog-head">
                            <h2>{editingId !== null ? "تعديل البيانات" : tableConfig[activePage]?.button}</h2>
                            <button type="button" className="x" onClick={() => setDialogOpen(false)}>×</button>
                        </div>

                        <form onSubmit={saveRecord}>
                            <div className="dialog-body fields">
                                {tableConfig[activePage]?.fields.map(field => (
                                    <div className="input-group" key={field[0]}>
                                        <label>{field[1]}</label>

                                        {field[2] === "select" ? (
                                            <select
                                                required
                                                value={formData[field[0]] || ""}
                                                onChange={e => setFormData(previous => ({
                                                    ...previous,
                                                    [field[0]]: e.target.value
                                                }))}
                                            >
                                                <option value="">اختر</option>
                                                {field[3].map(option => (
                                                    <option key={option} value={option}>{option}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={field[2]}
                                                required
                                                min={field[2] === "number" ? "0" : undefined}
                                                value={formData[field[0]] || ""}
                                                onChange={e => setFormData(previous => ({
                                                    ...previous,
                                                    [field[0]]: e.target.value
                                                }))}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="dialog-foot">
                                <button type="button" className="btn" onClick={() => setDialogOpen(false)}>إلغاء</button>
                                <button type="submit" className="btn btn-primary">حفظ البيانات</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && (
                <div className="toast-message">
                    {toast}
                </div>
            )}
        </div>
    );
}