/* ==========================================================
   Smart Health - تعريف الأقسام والبيانات التجريبية
   كل قسم عبارة عن: أعمدة + قواعد التحقق + بيانات أولية.
   لإضافة قسم جديد يكفي إضافة عنصر هنا وإضافته في القائمة (NAV) داخل app.js
   ========================================================== */
(function () {
    'use strict';

    var SH = (window.SH = {});

    function p2(n) { return n < 10 ? '0' + n : '' + n; }

    // تاريخ بصيغة yyyy-mm-dd بالتوقيت المحلي (offset = عدد الأيام من اليوم)
    SH.day = function (offset) {
        var d = new Date();
        d.setDate(d.getDate() + (offset || 0));
        return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate());
    };

    // ألوان الحالات
    SH.tones = {
        good: ['نشط', 'نشطة', 'متاح', 'متاحة', 'مكتمل', 'متوفر', 'جاهز', 'يعمل', 'تمت المراجعة'],
        warn: ['قيد الانتظار', 'تحتاج متابعة', 'تحت المتابعة', 'مخزون منخفض', 'قيد التنفيذ', 'قيد المراجعة'],
        bad: ['غير متاح', 'موقوف', 'موقوفة', 'يحتاج صيانة', 'خارج الخدمة', 'ملغي', 'نفد']
    };

    var UNITS = { section: 'units', key: 'name' };
    var PHONE = {
        pattern: '^01[0125][0-9]{8}$',
        patternMsg: 'رقم الهاتف يبدأ بـ 01 ويتكون من 11 رقمًا',
        maxlength: 11
    };

    SH.sections = [
        {
            key: 'patients', navLabel: 'المرضى', title: 'المرضى',
            desc: 'بيانات المرضى المسجلين وحالة المتابعة لكل منهم.',
            addLabel: 'إضافة مريض', label: 'name', prefix: 'P',
            columns: [
                { key: 'code', label: 'رقم المريض', auto: true },
                { key: 'name', label: 'اسم المريض', type: 'text', full: true },
                { key: 'age', label: 'العمر', type: 'number', min: 0, max: 120 },
                Object.assign({ key: 'phone', label: 'رقم الهاتف', type: 'tel' }, PHONE),
                { key: 'gender', label: 'النوع', type: 'select', options: ['ذكر', 'أنثى'] },
                { key: 'status', label: 'الحالة', type: 'select', options: ['نشط', 'تحت المتابعة', 'خرج'], badge: true }
            ],
            seed: function () {
                return [
                    { code: 'P001', name: 'أحمد محمد', age: 34, phone: '01012345678', gender: 'ذكر', status: 'نشط' },
                    { code: 'P002', name: 'مريم حسن', age: 28, phone: '01123456789', gender: 'أنثى', status: 'تحت المتابعة' },
                    { code: 'P003', name: 'عمر علي', age: 45, phone: '01234567890', gender: 'ذكر', status: 'نشط' },
                    { code: 'P004', name: 'فاطمة السيد', age: 52, phone: '01098765432', gender: 'أنثى', status: 'نشط' },
                    { code: 'P005', name: 'يوسف إبراهيم', age: 7, phone: '01156781234', gender: 'ذكر', status: 'تحت المتابعة' },
                    { code: 'P006', name: 'هدى عبد الله', age: 61, phone: '01223456780', gender: 'أنثى', status: 'نشط' },
                    { code: 'P007', name: 'كريم مصطفى', age: 39, phone: '01011223344', gender: 'ذكر', status: 'خرج' },
                    { code: 'P008', name: 'نورا خالد', age: 24, phone: '01155667788', gender: 'أنثى', status: 'نشط' },
                    { code: 'P009', name: 'محمود سعيد', age: 67, phone: '01244556677', gender: 'ذكر', status: 'تحت المتابعة' },
                    { code: 'P010', name: 'سلمى أحمد', age: 31, phone: '01077889900', gender: 'أنثى', status: 'نشط' }
                ];
            }
        },
        {
            key: 'appointments', navLabel: 'المواعيد', title: 'المواعيد',
            desc: 'حجوزات الكشف في الوحدات الصحية ومتابعة حالتها.',
            addLabel: 'حجز موعد', label: 'patient', prefix: 'A',
            columns: [
                { key: 'patient', label: 'المريض', type: 'select', optionsFrom: { section: 'patients', key: 'name' } },
                { key: 'doctor', label: 'الطبيب', type: 'select', optionsFrom: { section: 'doctors', key: 'name' } },
                { key: 'unit', label: 'الوحدة الصحية', type: 'select', optionsFrom: UNITS },
                { key: 'date', label: 'التاريخ', type: 'date', default: '@today' },
                { key: 'time', label: 'الوقت', type: 'time' },
                { key: 'status', label: 'الحالة', type: 'select', options: ['قيد الانتظار', 'مكتمل', 'ملغي'], badge: true, default: 'قيد الانتظار' }
            ],
            seed: function () {
                var d = SH.day;
                return [
                    { patient: 'أحمد محمد', doctor: 'د. سارة أحمد', unit: 'وحدة طنطا الصحية', date: d(0), time: '10:00', status: 'مكتمل' },
                    { patient: 'فاطمة السيد', doctor: 'د. طارق سمير', unit: 'وحدة طنطا الصحية', date: d(0), time: '09:00', status: 'مكتمل' },
                    { patient: 'مريم حسن', doctor: 'د. منى حسن', unit: 'وحدة السنطة', date: d(0), time: '11:30', status: 'قيد الانتظار' },
                    { patient: 'عمر علي', doctor: 'د. أحمد علي', unit: 'وحدة المحلة الكبرى', date: d(0), time: '12:00', status: 'قيد الانتظار' },
                    { patient: 'يوسف إبراهيم', doctor: 'د. أحمد علي', unit: 'وحدة المحلة الكبرى', date: d(-1), time: '10:30', status: 'مكتمل' },
                    { patient: 'هدى عبد الله', doctor: 'د. سارة أحمد', unit: 'وحدة طنطا الصحية', date: d(-1), time: '13:00', status: 'مكتمل' },
                    { patient: 'كريم مصطفى', doctor: 'د. خالد فؤاد', unit: 'وحدة زفتى', date: d(-1), time: '09:00', status: 'مكتمل' },
                    { patient: 'نورا خالد', doctor: 'د. هبة رمضان', unit: 'وحدة كفر الزيات', date: d(-2), time: '11:00', status: 'ملغي' },
                    { patient: 'عمر علي', doctor: 'د. سارة أحمد', unit: 'وحدة طنطا الصحية', date: d(-2), time: '12:00', status: 'مكتمل' },
                    { patient: 'يوسف إبراهيم', doctor: 'د. أحمد علي', unit: 'وحدة المحلة الكبرى', date: d(-2), time: '13:30', status: 'مكتمل' },
                    { patient: 'محمود سعيد', doctor: 'د. طارق سمير', unit: 'وحدة طنطا الصحية', date: d(-3), time: '12:15', status: 'مكتمل' },
                    { patient: 'مريم حسن', doctor: 'د. منى حسن', unit: 'وحدة السنطة', date: d(-3), time: '11:00', status: 'مكتمل' },
                    { patient: 'سلمى أحمد', doctor: 'د. خالد فؤاد', unit: 'وحدة زفتى', date: d(-4), time: '10:00', status: 'مكتمل' },
                    { patient: 'كريم مصطفى', doctor: 'د. سارة أحمد', unit: 'وحدة طنطا الصحية', date: d(-5), time: '09:30', status: 'مكتمل' },
                    { patient: 'أحمد محمد', doctor: 'د. طارق سمير', unit: 'وحدة طنطا الصحية', date: d(1), time: '10:00', status: 'قيد الانتظار' },
                    { patient: 'مريم حسن', doctor: 'د. أحمد علي', unit: 'وحدة المحلة الكبرى', date: d(2), time: '14:00', status: 'قيد الانتظار' }
                ];
            }
        },
        {
            key: 'labs', navLabel: 'التحاليل', title: 'التحاليل الطبية',
            desc: 'طلبات التحاليل ونتائجها.',
            addLabel: 'طلب تحليل', label: 'patient', prefix: 'L',
            columns: [
                { key: 'code', label: 'رقم الطلب', auto: true },
                { key: 'patient', label: 'المريض', type: 'select', optionsFrom: { section: 'patients', key: 'name' } },
                { key: 'test', label: 'نوع التحليل', type: 'select', options: ['صورة دم كاملة', 'سكر صائم', 'سكر تراكمي', 'وظائف كبد', 'وظائف كلى', 'تحليل بول', 'دهون الدم'] },
                { key: 'date', label: 'التاريخ', type: 'date', default: '@today' },
                { key: 'status', label: 'الحالة', type: 'select', options: ['قيد التنفيذ', 'جاهز'], badge: true, default: 'قيد التنفيذ' }
            ],
            seed: function () {
                var d = SH.day;
                return [
                    { code: 'L001', patient: 'أحمد محمد', test: 'صورة دم كاملة', date: d(0), status: 'جاهز' },
                    { code: 'L002', patient: 'مريم حسن', test: 'سكر صائم', date: d(0), status: 'قيد التنفيذ' },
                    { code: 'L003', patient: 'عمر علي', test: 'وظائف كبد', date: d(-1), status: 'جاهز' },
                    { code: 'L004', patient: 'محمود سعيد', test: 'سكر تراكمي', date: d(-1), status: 'قيد التنفيذ' },
                    { code: 'L005', patient: 'هدى عبد الله', test: 'دهون الدم', date: d(-3), status: 'جاهز' },
                    { code: 'L006', patient: 'فاطمة السيد', test: 'وظائف كلى', date: d(-4), status: 'جاهز' }
                ];
            }
        },
        {
            key: 'complaints', navLabel: 'الشكاوى والمقترحات', title: 'الشكاوى والمقترحات',
            desc: 'ما يصل من المرضى من شكاوى ومقترحات، وهل تمت مراجعته.',
            addLabel: 'تسجيل شكوى أو مقترح', label: 'patient', prefix: 'C',
            columns: [
                { key: 'code', label: 'الرقم', auto: true },
                { key: 'patient', label: 'مقدّم الطلب', type: 'select', optionsFrom: { section: 'patients', key: 'name' } },
                { key: 'type', label: 'النوع', type: 'select', options: ['شكوى', 'مقترح'] },
                { key: 'subject', label: 'الموضوع', type: 'text', full: true },
                { key: 'date', label: 'التاريخ', type: 'date', default: '@today' },
                { key: 'status', label: 'الحالة', type: 'select', options: ['قيد المراجعة', 'تمت المراجعة'], badge: true, default: 'قيد المراجعة' }
            ],
            seed: function () {
                var d = SH.day;
                return [
                    { code: 'C001', patient: 'أحمد محمد', type: 'شكوى', subject: 'التأخر في دخول الكشف أكثر من ساعة', date: d(0), status: 'قيد المراجعة' },
                    { code: 'C002', patient: 'مريم حسن', type: 'مقترح', subject: 'زيادة ساعات العيادة المسائية', date: d(-1), status: 'تمت المراجعة' },
                    { code: 'C003', patient: 'عمر علي', type: 'شكوى', subject: 'عدم توفر دواء الضغط بالصيدلية', date: d(-2), status: 'قيد المراجعة' },
                    { code: 'C004', patient: 'هدى عبد الله', type: 'مقترح', subject: 'إضافة مقاعد انتظار في الدور الأول', date: d(-4), status: 'تمت المراجعة' }
                ];
            }
        },
        {
            key: 'doctors', navLabel: 'الأطباء', title: 'الأطباء',
            desc: 'الأطباء وتخصصاتهم والوحدات التي يعملون بها.',
            addLabel: 'إضافة طبيب', label: 'name', prefix: 'DR',
            columns: [
                { key: 'name', label: 'الاسم', type: 'text', full: true },
                { key: 'specialty', label: 'التخصص', type: 'select', options: ['باطنة', 'أطفال', 'نساء وتوليد', 'عظام', 'أسنان', 'قلب', 'جلدية', 'عيون'] },
                Object.assign({ key: 'phone', label: 'رقم الهاتف', type: 'tel' }, PHONE),
                { key: 'unit', label: 'الوحدة الصحية', type: 'select', optionsFrom: UNITS },
                { key: 'status', label: 'الحالة', type: 'select', options: ['متاح', 'غير متاح'], badge: true, default: 'متاح' }
            ],
            seed: function () {
                return [
                    { name: 'د. سارة أحمد', specialty: 'باطنة', phone: '01011111111', unit: 'وحدة طنطا الصحية', status: 'متاح' },
                    { name: 'د. أحمد علي', specialty: 'أطفال', phone: '01022222222', unit: 'وحدة المحلة الكبرى', status: 'متاح' },
                    { name: 'د. منى حسن', specialty: 'نساء وتوليد', phone: '01033333333', unit: 'وحدة السنطة', status: 'غير متاح' },
                    { name: 'د. خالد فؤاد', specialty: 'عظام', phone: '01044440001', unit: 'وحدة زفتى', status: 'متاح' },
                    { name: 'د. هبة رمضان', specialty: 'أسنان', phone: '01055550002', unit: 'وحدة كفر الزيات', status: 'متاح' },
                    { name: 'د. طارق سمير', specialty: 'قلب', phone: '01066660003', unit: 'وحدة طنطا الصحية', status: 'متاح' }
                ];
            }
        },
        {
            key: 'staff', navLabel: 'العاملون', title: 'العاملون',
            desc: 'التمريض والإداريون والفنيون في الوحدات.',
            addLabel: 'إضافة موظف', label: 'name', prefix: 'ST',
            columns: [
                { key: 'code', label: 'رقم الموظف', auto: true },
                { key: 'name', label: 'الاسم', type: 'text', full: true },
                { key: 'role', label: 'الوظيفة', type: 'select', options: ['تمريض', 'استقبال', 'صيدلي', 'فني معمل', 'إداري'] },
                { key: 'unit', label: 'الوحدة الصحية', type: 'select', optionsFrom: UNITS },
                Object.assign({ key: 'phone', label: 'رقم الهاتف', type: 'tel' }, PHONE)
            ],
            seed: function () {
                return [
                    { code: 'ST001', name: 'محمد إبراهيم', role: 'تمريض', unit: 'وحدة طنطا الصحية', phone: '01044444444' },
                    { code: 'ST002', name: 'سارة محمود', role: 'استقبال', unit: 'وحدة المحلة الكبرى', phone: '01055555555' },
                    { code: 'ST003', name: 'منى أحمد', role: 'صيدلي', unit: 'وحدة السنطة', phone: '01066666666' },
                    { code: 'ST004', name: 'إيمان فتحي', role: 'تمريض', unit: 'وحدة زفتى', phone: '01077777777' },
                    { code: 'ST005', name: 'حسام الدين', role: 'فني معمل', unit: 'وحدة كفر الزيات', phone: '01088888888' }
                ];
            }
        },
        {
            key: 'units', navLabel: 'الوحدات الصحية', title: 'الوحدات الصحية',
            desc: 'الوحدات التابعة للمديرية وحالة كل وحدة.',
            addLabel: 'إضافة وحدة', label: 'name', prefix: 'U',
            columns: [
                { key: 'code', label: 'الكود', auto: true },
                { key: 'name', label: 'اسم الوحدة', type: 'text', full: true },
                { key: 'governorate', label: 'المحافظة', type: 'text', default: 'الغربية' },
                { key: 'doctors', label: 'عدد الأطباء', type: 'number', min: 0, max: 500 },
                { key: 'patients', label: 'عدد المرضى', type: 'number', min: 0, max: 100000 },
                { key: 'status', label: 'الحالة', type: 'select', options: ['نشطة', 'تحتاج متابعة'], badge: true, default: 'نشطة' }
            ],
            seed: function () {
                return [
                    { code: 'U001', name: 'وحدة طنطا الصحية', governorate: 'الغربية', doctors: 12, patients: 350, status: 'نشطة' },
                    { code: 'U002', name: 'وحدة المحلة الكبرى', governorate: 'الغربية', doctors: 10, patients: 280, status: 'نشطة' },
                    { code: 'U003', name: 'وحدة السنطة', governorate: 'الغربية', doctors: 8, patients: 190, status: 'تحتاج متابعة' },
                    { code: 'U004', name: 'وحدة زفتى', governorate: 'الغربية', doctors: 9, patients: 220, status: 'نشطة' },
                    { code: 'U005', name: 'وحدة كفر الزيات', governorate: 'الغربية', doctors: 7, patients: 210, status: 'تحتاج متابعة' }
                ];
            }
        },
        {
            key: 'departments', navLabel: 'الأقسام الطبية', title: 'الأقسام الطبية',
            desc: 'الأقسام والتخصصات داخل كل وحدة.',
            addLabel: 'إضافة قسم', label: 'name', prefix: 'D',
            columns: [
                { key: 'code', label: 'الكود', auto: true },
                { key: 'name', label: 'اسم القسم', type: 'text', full: true },
                { key: 'doctors', label: 'عدد الأطباء', type: 'number', min: 0, max: 500 },
                { key: 'unit', label: 'الوحدة الصحية', type: 'select', optionsFrom: UNITS },
                { key: 'status', label: 'الحالة', type: 'select', options: ['نشط', 'موقوف'], badge: true, default: 'نشط' }
            ],
            seed: function () {
                return [
                    { code: 'D001', name: 'الباطنة', doctors: 5, unit: 'وحدة طنطا الصحية', status: 'نشط' },
                    { code: 'D002', name: 'الأطفال', doctors: 4, unit: 'وحدة المحلة الكبرى', status: 'نشط' },
                    { code: 'D003', name: 'النساء والتوليد', doctors: 3, unit: 'وحدة السنطة', status: 'نشط' },
                    { code: 'D004', name: 'الأسنان', doctors: 2, unit: 'وحدة كفر الزيات', status: 'نشط' },
                    { code: 'D005', name: 'العظام', doctors: 2, unit: 'وحدة زفتى', status: 'موقوف' }
                ];
            }
        },
        {
            key: 'services', navLabel: 'الخدمات الطبية', title: 'الخدمات الطبية',
            desc: 'الخدمات التي تقدمها الوحدات للمرضى.',
            addLabel: 'إضافة خدمة', label: 'name', prefix: 'S',
            columns: [
                { key: 'code', label: 'الكود', auto: true },
                { key: 'name', label: 'اسم الخدمة', type: 'text', full: true },
                { key: 'department', label: 'القسم', type: 'select', optionsFrom: { section: 'departments', key: 'name' } },
                { key: 'unit', label: 'الوحدة الصحية', type: 'select', optionsFrom: UNITS },
                { key: 'status', label: 'الحالة', type: 'select', options: ['متاحة', 'موقوفة'], badge: true, default: 'متاحة' }
            ],
            seed: function () {
                return [
                    { code: 'S001', name: 'الكشف العام', department: 'الباطنة', unit: 'وحدة طنطا الصحية', status: 'متاحة' },
                    { code: 'S002', name: 'متابعة الأطفال', department: 'الأطفال', unit: 'وحدة المحلة الكبرى', status: 'متاحة' },
                    { code: 'S003', name: 'التطعيمات', department: 'الأطفال', unit: 'وحدة السنطة', status: 'متاحة' },
                    { code: 'S004', name: 'رعاية الحوامل', department: 'النساء والتوليد', unit: 'وحدة السنطة', status: 'متاحة' },
                    { code: 'S005', name: 'قياس الضغط والسكر', department: 'الباطنة', unit: 'وحدة زفتى', status: 'متاحة' },
                    { code: 'S006', name: 'علاج الأسنان', department: 'الأسنان', unit: 'وحدة كفر الزيات', status: 'موقوفة' }
                ];
            }
        },
        {
            key: 'inventory', navLabel: 'المخزون الطبي', title: 'المخزون الطبي',
            desc: 'الأدوية والمستلزمات والكميات المتاحة منها.',
            addLabel: 'إضافة صنف', label: 'name', prefix: 'M',
            formNote: 'تُحسب الحالة تلقائيًا: يعتبر الصنف منخفضًا عند أقل من 50 وحدة.',
            columns: [
                { key: 'code', label: 'الكود', auto: true },
                { key: 'name', label: 'اسم الصنف', type: 'text', full: true },
                { key: 'qty', label: 'الكمية', type: 'number', min: 0, max: 100000 },
                { key: 'unit', label: 'وحدة القياس', type: 'select', options: ['علبة', 'عبوة', 'زجاجة', 'قطعة'] },
                { key: 'expiry', label: 'تاريخ الصلاحية', type: 'month' },
                { key: 'status', label: 'الحالة', computed: true, badge: true, options: ['متوفر', 'مخزون منخفض', 'نفد'] }
            ],
            compute: function (r) {
                var q = Number(r.qty);
                r.status = q <= 0 ? 'نفد' : (q < 50 ? 'مخزون منخفض' : 'متوفر');
            },
            seed: function () {
                return [
                    { code: 'M001', name: 'باراسيتامول', qty: 500, unit: 'علبة', expiry: '2027-12' },
                    { code: 'M002', name: 'شاش طبي', qty: 20, unit: 'عبوة', expiry: '2027-06' },
                    { code: 'M003', name: 'قفازات طبية', qty: 350, unit: 'علبة', expiry: '2027-08' },
                    { code: 'M004', name: 'محلول ملحي', qty: 120, unit: 'زجاجة', expiry: '2027-03' },
                    { code: 'M005', name: 'أنسولين', qty: 35, unit: 'عبوة', expiry: '2027-01' },
                    { code: 'M006', name: 'سرنجات', qty: 800, unit: 'علبة', expiry: '2028-02' },
                    { code: 'M007', name: 'كمامات', qty: 15, unit: 'علبة', expiry: '2027-09' }
                ];
            }
        },
        {
            key: 'equipment', navLabel: 'الأجهزة الطبية', title: 'الأجهزة الطبية',
            desc: 'الأجهزة المسجلة وموعد آخر صيانة لكل جهاز.',
            addLabel: 'إضافة جهاز', label: 'name', prefix: 'E',
            columns: [
                { key: 'code', label: 'الكود', auto: true },
                { key: 'name', label: 'اسم الجهاز', type: 'text', full: true },
                { key: 'unit', label: 'الوحدة الصحية', type: 'select', optionsFrom: UNITS },
                { key: 'lastService', label: 'آخر صيانة', type: 'date', default: '@today' },
                { key: 'status', label: 'الحالة', type: 'select', options: ['يعمل', 'يحتاج صيانة', 'خارج الخدمة'], badge: true, default: 'يعمل' }
            ],
            seed: function () {
                var d = SH.day;
                return [
                    { code: 'E001', name: 'جهاز قياس الضغط', unit: 'وحدة طنطا الصحية', lastService: d(-33), status: 'يعمل' },
                    { code: 'E002', name: 'جهاز رسم القلب', unit: 'وحدة المحلة الكبرى', lastService: d(-49), status: 'يحتاج صيانة' },
                    { code: 'E003', name: 'جهاز قياس السكر', unit: 'وحدة السنطة', lastService: d(-14), status: 'يعمل' },
                    { code: 'E004', name: 'جهاز الأشعة', unit: 'وحدة زفتى', lastService: d(-90), status: 'خارج الخدمة' },
                    { code: 'E005', name: 'جهاز التعقيم', unit: 'وحدة كفر الزيات', lastService: d(-20), status: 'يعمل' }
                ];
            }
        },
        {
            key: 'users', navLabel: 'المستخدمون', title: 'المستخدمون',
            desc: 'حسابات من يستخدمون النظام وصلاحياتهم.',
            addLabel: 'إضافة مستخدم', label: 'name', prefix: 'USR', adminOnly: true,
            columns: [
                { key: 'name', label: 'الاسم', type: 'text', full: true },
                { key: 'email', label: 'البريد الإلكتروني', type: 'email', unique: true },
                { key: 'role', label: 'الدور', type: 'select', options: ['مدير النظام', 'موظف', 'طبيب'] },
                { key: 'unit', label: 'الوحدة', type: 'select', optionsFrom: { section: 'units', key: 'name', extra: ['الإدارة المركزية'] } },
                { key: 'status', label: 'الحالة', type: 'select', options: ['نشط', 'موقوف'], badge: true, default: 'نشط' }
            ],
            seed: function () {
                return [
                    { name: 'نسرين محمد', email: 'admin@gmail.com', role: 'مدير النظام', unit: 'الإدارة المركزية', status: 'نشط' },
                    { name: 'محمد إبراهيم', email: 'staff@gmail.com', role: 'موظف', unit: 'وحدة طنطا الصحية', status: 'نشط' },
                    { name: 'د. سارة أحمد', email: 'doctor@gmail.com', role: 'طبيب', unit: 'وحدة المحلة الكبرى', status: 'نشط' }
                ];
            }
        }
    ];
})();