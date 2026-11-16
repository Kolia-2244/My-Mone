/* =========================================================

   MY MONE — APP.JS

   Повна логіка застосунку

   ========================================================= */

/* =========================================================

   GLOBAL DATA

   ========================================================= */

/* Безпечний доступ до localStorage (Safari Private, переповнення, зіпсовані дані) */

function safeGet(key) {

    try {

        return localStorage.getItem(key);

    } catch (error) {

        return null;

    }

}

function safeSet(key, value) {

    try {

        localStorage.setItem(key, value);

        return true;

    } catch (error) {

        return false;

    }

}

function loadArray(key) {

    try {

        const value = JSON.parse(safeGet(key));

        return Array.isArray(value) ? value : [];

    } catch (error) {

        return [];

    }

}

function loadNumber(key) {

    const number = Number(safeGet(key));

    return Number.isFinite(number) ? number : 0;

}

let transactions = loadArray("myMoneTransactions");

let budget = loadNumber("myMoneBudget");

let goals = loadArray("myMoneGoals");

let userName = safeGet("myMoneUserName") || "Користувач";

let installments = loadArray("myMoneInstallments");

let customRules = loadArray("myMoneRules");

let selectedInstallmentBank = "";

let editingTransactionId = null;

let selectedGoalId = null;

let analyticsDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

let analyticsMode = "month";

let currentTransactionType = "all";

let currentCategoryFilter = "all";

let selectedAnalyticsCategory = null;

/* =========================================================

   CONSTANTS

   ========================================================= */

const MONTHS = [

    "Січень",

    "Лютий",

    "Березень",

    "Квітень",

    "Травень",

    "Червень",

    "Липень",

    "Серпень",

    "Вересень",

    "Жовтень",

    "Листопад",

    "Грудень"

];

const SHORT_MONTHS = [

    "Січ",

    "Лют",

    "Бер",

    "Кві",

    "Тра",

    "Чер",

    "Лип",

    "Сер",

    "Вер",

    "Жов",

    "Лис",

    "Гру"

];

/* =========================================================

   CATEGORIES

   ========================================================= */

const categories = {

    "Інше": {

        icon: "📦",

        saving: "Середній",

        savingClass: "medium",

        subcategories: {

            "Інше": "📦"

        }

    },

    "Транспорт": {

        icon: "🚍",

        saving: "Середній",

        savingClass: "medium",

        subcategories: {

            "Таксі": "🚕",

            "Автобус": "🚌",

            "Тролейбус": "🚎",

            "Маршрутка": "🚐",

            "Потяг": "🚆",

            "Метро": "🚇"

        }

    },

    "Одяг": {

        icon: "👕",

        saving: "Середній",

        savingClass: "medium",

        subcategories: {

            "Футболки": "👕",

            "Сорочки": "👔",

            "Джинси": "👖",

            "Штани": "👖",

            "Куртки": "🧥",

            "Взуття": "👟",

            "Аксесуари": "🧢"

        }

    },

    "Їжа": {

        icon: "🍔",

        saving: "Низький",

        savingClass: "low",

        subcategories: {

            "Продукти": "🛒",

            "Кафе": "☕",

            "Ресторан": "🍽️",

            "Доставка": "🛵",

            "Фастфуд": "🍔"

        }

    },

    "Стіки": {

        icon: "🚬",

        saving: "Високий",

        savingClass: "high",

        subcategories: {

            "Стіки": "🚬"

        }

    },

    "Покупки": {

        icon: "🛍️",

        saving: "Середній",

        savingClass: "medium",

        subcategories: {

            "Техніка": "💻",

            "Електроніка": "📱",

            "Косметика": "🧴",

            "Товари для дому": "🏠"

        }

    },

    "Розваги": {

        icon: "🎮",

        saving: "Високий",

        savingClass: "high",

        subcategories: {

            "Ігри": "🎮",

            "Кіно": "🎬",

            "Підписки": "📺",

            "Концерти": "🎵"

        }

    },

    "Дім": {

        icon: "🏠",

        saving: "Середній",

        savingClass: "medium",

        subcategories: {

            "Комунальні": "💡",

            "Побутова хімія": "🧹",

            "Ремонт": "🔨",

            "Меблі": "🛋️",

            "Техніка": "🧊"

        }

    }

};

/* =========================================================

   KEYWORDS

   ========================================================= */

const categoryRules = [

    {

        category: "Транспорт",

        subcategory: "Таксі",

        keywords: [

            "таксі",

            "такси",

            "taxi",

            "uber",

            "bolt"

        ]

    },

    {

        category: "Транспорт",

        subcategory: "Автобус",

        keywords: [

            "автобус",

            "bus"

        ]

    },

    {

        category: "Транспорт",

        subcategory: "Тролейбус",

        keywords: [

            "тролейбус"

        ]

    },

    {

        category: "Транспорт",

        subcategory: "Маршрутка",

        keywords: [

            "маршрутка"

        ]

    },

    {

        category: "Транспорт",

        subcategory: "Потяг",

        keywords: [

            "потяг",

            "поїзд",

            "залізниц",

            "укрзалізниц"

        ]

    },

    {

        category: "Транспорт",

        subcategory: "Метро",

        keywords: [

            "метро"

        ]

    },

    {

        category: "Одяг",

        subcategory: "Футболки",

        keywords: [

            "футболка",

            "футболки",

            "майка",

            "майки"

        ]

    },

    {

        category: "Одяг",

        subcategory: "Сорочки",

        keywords: [

            "сорочка",

            "сорочки"

        ]

    },

    {

        category: "Одяг",

        subcategory: "Джинси",

        keywords: [

            "джинси",

            "джинси"

        ]

    },

    {

        category: "Одяг",

        subcategory: "Штани",

        keywords: [

            "штани",

            "брюки"

        ]

    },

    {

        category: "Одяг",

        subcategory: "Куртки",

        keywords: [

            "куртка",

            "куртки",

            "пальто",

            "пуховик"

        ]

    },

    {

        category: "Одяг",

        subcategory: "Взуття",

        keywords: [

            "кросівки",

            "кроссовки",

            "взуття",

            "черевики",

            "туфлі",

            "ботинки"

        ]

    },

    {

        category: "Одяг",

        subcategory: "Аксесуари",

        keywords: [

            "ремінь",

            "ремень",

            "шапка",

            "кепка",

            "сумка",

            "рюкзак",

            "гаманець",

            "окуляри"

        ]

    },

    {

        category: "Їжа",

        subcategory: "Продукти",

        keywords: [

            "прод",

            "продукти",

            "їжа",

            "їжу",

            "харчі",

            "атб",

            "сільпо",

            "silpo",

            "novus",

            "новус",

            "сімі",

            "сими",

            "велмарт",

            "welmart",

            "хліб",

            "молоко",

            "сир",

            "м'ясо",

            "мясо",

            "овочі",

            "фрукти"

        ]

    },

    {

        category: "Їжа",

        subcategory: "Кафе",

        keywords: [

            "кафе",

            "кав'ярня",

            "кавярня",

            "кава",

            "лате",

            "капучино"

        ]

    },

    {

        category: "Їжа",

        subcategory: "Ресторан",

        keywords: [

            "ресторан",

            "рестик",

            "бар"

        ]

    },

    {

        category: "Їжа",

        subcategory: "Доставка",

        keywords: [

            "доставка",

            "glovo",

            "bolt food",

            "ракета"

        ]

    },

    {

        category: "Їжа",

        subcategory: "Фастфуд",

        keywords: [

            "макдональдс",

            "макдоналдс",

            "mcdonald",

            "kfc",

            "бургер",

            "шаурма",

            "донер",

            "піца",

            "піцa"

        ]

    },

    {

        category: "Стіки",

        subcategory: "Стіки",

        keywords: [

            "стіки",

            "стік",

            "heets",

            "terea",

            "тереа"

        ]

    },

    {

        category: "Покупки",

        subcategory: "Техніка",

        keywords: [

            "ноутбук",

            "ноут",

            "комп'ютер",

            "компютер",

            "пк",

            "телевізор",

            "телевізор",

            "монітор",

            "кондиціонер"

        ]

    },

    {

        category: "Покупки",

        subcategory: "Електроніка",

        keywords: [

            "айфон",

            "iphone",

            "телефон",

            "смартфон",

            "samsung",

            "ipad",

            "планшет",

            "навушники",

            "airpods",

            "зарядка",

            "кабель",

            "powerbank"

        ]

    },

    {

        category: "Покупки",

        subcategory: "Косметика",

        keywords: [

            "косметика",

            "парфуми",

            "парфюм",

            "духи",

            "крем",

            "шампунь",

            "гель"

        ]

    },

    {

        category: "Покупки",

        subcategory: "Товари для дому",

        keywords: [

            "для дому",

            "посуд",

            "тарілка",

            "чашка",

            "лампа",

            "рушник"

        ]

    },

    {

        category: "Розваги",

        subcategory: "Ігри",

        keywords: [

            "гра",

            "ігри",

            "steam",

            "playstation",

            "xbox",

            "ps5",

            "ps4"

        ]

    },

    {

        category: "Розваги",

        subcategory: "Кіно",

        keywords: [

            "кіно",

            "cinema",

            "фільм",

            "сеанс"

        ]

    },

    {

        category: "Розваги",

        subcategory: "Підписки",

        keywords: [

            "netflix",

            "spotify",

            "youtube premium",

            "підписка",

            "підписки",

            "discord nitro"

        ]

    },

    {

        category: "Розваги",

        subcategory: "Концерти",

        keywords: [

            "концерт",

            "концерти",

            "фестиваль"

        ]

    },

    {

        category: "Дім",

        subcategory: "Комунальні",

        keywords: [

            "комуналка",

            "комунальні",

            "світло",

            "газ",

            "вода",

            "опалення",

            "електроенергія"

        ]

    },

    {

        category: "Дім",

        subcategory: "Побутова хімія",

        keywords: [

            "порошок",

            "пральний порошок",

            "миючий",

            "мийний",

            "хімія",

            "побутова хімія"

        ]

    },

    {

        category: "Дім",

        subcategory: "Ремонт",

        keywords: [

            "ремонт",

            "фарба",

            "інструмент",

            "дриль",

            "шуруповерт",

            "цвяхи"

        ]

    },

    {

        category: "Дім",

        subcategory: "Меблі",

        keywords: [

            "меблі",

            "диван",

            "ліжко",

            "стіл",

            "стілець",

            "шафа",

            "матрац"

        ]

    },

    {

        category: "Дім",

        subcategory: "Техніка",

        keywords: [

            "холодильник",

            "пральна машина",

            "посудомийка",

            "мікрохвильовка",

            "мікрохвильова",

            "духовка",

            "пилосос",

            "морозильник"

        ]

    }

];

/* =========================================================

   HELPERS

   ========================================================= */

function $(id) {

    return document.getElementById(id);

}

function formatMoney(value) {

    const number = Number(value) || 0;

    return new Intl.NumberFormat("uk-UA", {

        minimumFractionDigits: 0,

        maximumFractionDigits: 2

    }).format(number) + " ₴";

}

function normalizeText(text) {

    return String(text || "")

        .toLowerCase()

        .trim()

        .replace(/[.,!?;:()[\]{}"'’ʼ`]/g, " ")

        .replace(/\s+/g, " ");

}

function saveData() {

    const ok = [

        safeSet("myMoneTransactions", JSON.stringify(transactions)),

        safeSet("myMoneBudget", String(budget)),

        safeSet("myMoneGoals", JSON.stringify(goals)),

        safeSet("myMoneUserName", userName),

        safeSet("myMoneInstallments", JSON.stringify(installments)),

        safeSet("myMoneRules", JSON.stringify(customRules))

    ].every(Boolean);

    if (!ok) {

        showToast("⚠️", "Не вдалося зберегти дані на цьому пристрої");

    }

    return ok;

}

function cleanId(value) {

    return String(value || "").replace(/[^\w.\-]/g, "_");

}

function parseAmount(value) {

    const number = Number(

        String(value || "")

            .replace(/\s/g, "")

            .replace(",", ".")

    );

    return Number.isFinite(number)

        ? Math.round(number * 100) / 100

        : 0;

}

function sumAmount(list) {

    return list.reduce(

        (sum, item) => sum + Number(item.amount || 0),

        0

    );

}

function generateId() {

    return Date.now() + Math.random().toString(16).slice(2);

}

function getTodayISO() {

    const date = new Date();

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, "0");

    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}

function parseDate(value) {

    if (!value) return new Date();

    if (typeof value === "string") {

        const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

        if (match) {

            return new Date(

                Number(match[1]),

                Number(match[2]) - 1,

                Number(match[3])

            );

        }

    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {

        return new Date();

    }

    return date;

}

function formatDate(value) {

    const date = parseDate(value);

    return date.toLocaleDateString("uk-UA", {

        day: "2-digit",

        month: "2-digit",

        year: "numeric"

    });

}

function getMonthKey(date = new Date()) {

    return `${date.getFullYear()}-${String(

        date.getMonth() + 1

    ).padStart(2, "0")}`;

}

function getMonthKeyFromString(value) {

    const date = parseDate(value);

    return getMonthKey(date);

}

function isSameMonth(dateValue, year, month) {

    const date = parseDate(dateValue);

    return (

        date.getFullYear() === year &&

        date.getMonth() === month

    );

}

function getExpenses() {

    return transactions.filter(

        transaction =>

            transaction.type === "expense" &&

            !transaction.deleted

    );

}

function getIncomeTransactions() {

    return transactions.filter(

        transaction =>

            transaction.type === "income" &&

            !transaction.deleted

    );

}

/* =========================================================

   MIGRATION

   ========================================================= */

function migrateData() {

    let changed = false;

    const cleaned = [];

    customRules = customRules.filter(

        rule =>

            rule &&

            typeof rule.key === "string" &&

            rule.key &&

            categories[rule.category] &&

            categories[rule.category].subcategories[rule.subcategory] !== undefined

    );

    transactions.forEach(transaction => {

        if (!transaction || typeof transaction !== "object") {

            changed = true;

            return;

        }

        const item = { ...transaction };

        if (item.type !== "income" && item.type !== "expense") {

            changed = true;

            return;

        }

        item.amount = Number(item.amount);

        if (!Number.isFinite(item.amount) || item.amount <= 0 || item.deleted) {

            changed = true;

            return;

        }

        if (item.category === "Автомобіль") {

            item.category = "Транспорт";

            item.subcategory = item.subcategory || "Інше";

            changed = true;

        }

        if (item.store) {

            delete item.store;

            changed = true;

        }

        const id = item.id ? cleanId(item.id) : generateId();

        if (id !== item.id) {

            item.id = id;

            changed = true;

        }

        if (item.installmentId) {

            const linked = cleanId(item.installmentId);

            if (linked !== item.installmentId) {

                item.installmentId = linked;

                changed = true;

            }

        }

        if (!item.date || Number.isNaN(new Date(item.date).getTime())) {

            item.date = new Date().toISOString();

            changed = true;

        }

        if (item.type === "expense" && !categories[item.category]) {

            item.subcategory = item.subcategory || "Інше";

            item.category = "Інше";

            changed = true;

        }

        cleaned.push(item);

    });

    transactions = cleaned;

    /* Старі версії зберігали загальний дохід окремим числом.

       Тепер дохід рахується з операцій — переносимо різницю. */

    const legacyIncome = loadNumber("myMoneIncome");

    if (legacyIncome > 0) {

        const known = sumAmount(

            transactions.filter(item => item.type === "income")

        );

        const difference = legacyIncome - known;

        if (difference > 0.009) {

            const now = new Date().toISOString();

            transactions.push({

                id: generateId(),

                type: "income",

                amount: Math.round(difference * 100) / 100,

                description: "Баланс зі старої версії",

                date: now,

                createdAt: now

            });

        }

        safeSet("myMoneIncome", "0");

        changed = true;

    }

    const installmentsBefore = JSON.stringify(installments);

    installments = installments

        .filter(item => item && typeof item === "object")

        .map(item => {

            const result = { ...item };

            result.id = cleanId(result.id) || generateId();

            result.amount = Number(result.amount) || 0;

            result.term = Math.max(Number(result.term) || 1, 1);

            result.monthlyPayment =

                Number(result.monthlyPayment) ||

                result.amount / result.term;

            result.paidMonths = Number(result.paidMonths) || 0;

            result.description = String(result.description || "Покупка");

            if (!Array.isArray(result.payments)) {

                result.payments = [];

            }

            if (!categories[result.category]) {

                result.subcategory = result.subcategory || "Інше";

                result.category = "Інше";

            }

            return result;

        });

    const goalsBefore = JSON.stringify(goals);

    goals = goals

        .filter(item => item && typeof item === "object")

        .map(item => ({

            ...item,

            id: cleanId(item.id) || generateId(),

            name: String(item.name || "Ціль"),

            target: Number(item.target) || 0,

            current: Number(item.current) || 0

        }));

    if (

        changed ||

        installmentsBefore !== JSON.stringify(installments) ||

        goalsBefore !== JSON.stringify(goals)

    ) {

        saveData();

    }

}

/* =========================================================

   CATEGORY DETECTION

   ========================================================= */

let categoryKeywordIndex = null;

function buildKeywordIndex() {

    const list = [];

    categoryRules.forEach(rule => {

        rule.keywords.forEach(keyword => {

            const kw = normalizeText(keyword);

            if (!kw) return;

            /* "футболка" → також ловить "футболку", "футболки" */

            const stem =

                kw.length >= 5 && /[аяиіую]$/.test(kw)

                    ? kw.slice(0, -1)

                    : kw;

            list.push({ kw, stem, rule });

        });

    });

    /* Довші ключові слова мають пріоритет ("bolt food" над "bolt") */

    list.sort((a, b) => b.kw.length - a.kw.length);

    categoryKeywordIndex = list;

}

function keywordMatches(text, entry) {

    const padded = ` ${text} `;

    if (entry.kw.length <= 3) {

        return padded.includes(` ${entry.kw} `);

    }

    return padded.includes(` ${entry.stem}`);

}

function findCustomRule(text) {

    const padded = ` ${text} `;

    let best = null;

    customRules.forEach(rule => {

        if (padded.includes(` ${rule.key} `)) {

            if (!best || rule.key.length > best.key.length) {

                best = rule;

            }

        }

    });

    return best;

}

function saveCustomRule(description, category, subcategory) {

    const key = normalizeText(description);

    if (!key || key.length < 2) return;

    customRules = customRules.filter(rule => rule.key !== key);

    customRules.unshift({ key, category, subcategory });

    if (customRules.length > 300) {

        customRules.length = 300;

    }

}

function categoryOptionsHTML(includeAuto) {

    let html = includeAuto

        ? '<option value="">🤖 Автоматично</option>'

        : "";

    Object.entries(categories).forEach(([category, info]) => {

        html += `<optgroup label="${escapeAttribute(category)}">`;

        Object.entries(info.subcategories).forEach(([sub, icon]) => {

            html += `<option value="${escapeAttribute(category)}|${escapeAttribute(sub)}">${icon} ${escapeHTML(sub)}</option>`;

        });

        html += "</optgroup>";

    });

    return html;

}

function fillCategorySelects() {

    if ($("expense-category-select")) {

        $("expense-category-select").innerHTML = categoryOptionsHTML(true);

    }

    if ($("edit-category-select")) {

        $("edit-category-select").innerHTML = categoryOptionsHTML(false);

    }

}

function parseCategoryValue(value) {

    const [category, subcategory] = String(value || "").split("|");

    if (

        categories[category] &&

        categories[category].subcategories[subcategory] !== undefined

    ) {

        return {

            category,

            subcategory,

            icon: getCategoryIcon(category, subcategory),

            matched: true

        };

    }

    return null;

}

function detectCategory(description) {

    const text = normalizeText(description);

    if (!text) {

        return null;

    }

    const rule = findCustomRule(text);

    if (rule) {

        return {

            category: rule.category,

            subcategory: rule.subcategory,

            icon: getCategoryIcon(rule.category, rule.subcategory),

            matched: true,

            source: "rule"

        };

    }

    if (!categoryKeywordIndex) {

        buildKeywordIndex();

    }

    for (const entry of categoryKeywordIndex) {

        if (keywordMatches(text, entry)) {

            return {

                category: entry.rule.category,

                subcategory: entry.rule.subcategory,

                icon: getCategoryIcon(

                    entry.rule.category,

                    entry.rule.subcategory

                ),

                matched: true

            };

        }

    }

    return null;

}

function detectCategoryOrDefault(description) {

    return detectCategory(description) || {

        category: "Інше",

        subcategory: "Інше",

        icon: getCategoryIcon("Інше", "Інше"),

        matched: false

    };

}

/* =========================================================

   CATEGORY ICON

   ========================================================= */

function getCategoryIcon(category, subcategory = "") {

    if (

        categories[category] &&

        categories[category].subcategories &&

        categories[category].subcategories[subcategory]

    ) {

        return categories[category].subcategories[subcategory];

    }

    return categories[category]?.icon || "💰";

}

/* =========================================================

   PREDICTION

   ========================================================= */

/* Common example names are inserted using DOM text (no previous-name suggestions). */

const expenseExamples = [

    { icon: "🛒", name: "Продукти", value: "продукти" },

    { icon: "🚕", name: "Таксі", value: "таксі" },

    { icon: "☕", name: "Кава", value: "кава" },

    { icon: "👕", name: "Футболка", value: "футболка" },

    { icon: "🚬", name: "Стіки", value: "стіки" },

    { icon: "🧊", name: "Холодильник", value: "холодильник" }

];

let expensePickerCategory = "";

function createExpenseChip(label, value, icon = "") {

    const button = document.createElement("button");

    button.type = "button";

    button.className = "expense-preset-chip";

    button.textContent = icon ? `${icon} ${label}` : label;

    button.addEventListener("click", () => useExpenseExample(value));

    return button;

}

function renderExpenseExamples() {

    const presets = $("expense-presets");

    if (presets) {

        presets.replaceChildren(...expenseExamples.map(item =>

            createExpenseChip(item.name, item.value, item.icon)

        ));

    }

}

function useExpenseExample(value) {

    const input = $("expense-description");

    if (!input) return;

    input.value = value;

    $("expense-category-select").value = "";

    $("expense-category-picker").hidden = true;

    $("expense-change-category")?.setAttribute("aria-expanded", "false");

    onExpenseDescriptionInput();

    if (!String($("expense-amount")?.value || "").trim()) {

        $("expense-amount")?.focus();

    } else {

        input.focus();

    }

}

function clearExpenseDescription() {

    const input = $("expense-description");

    if (!input) return;

    input.value = "";

    $("expense-category-select").value = "";

    $("expense-category-picker").hidden = true;

    onExpenseDescriptionInput();

    input.focus();

}

/* Accept "200 таксі" as well as the ordinary two-field flow. */

function onExpenseDescriptionInput() {

    const input = $("expense-description");

    const amountInput = $("expense-amount");

    if (input && amountInput && !amountInput.value.trim()) {

        const raw = input.value.trim();

        const match = raw.match(/^(\d{1,7}(?:[.,]\d{1,2})?)\s*(?:грн|₴)?\s+(.{2,})$/i);

        if (match && parseAmount(match[1]) > 0) {

            amountInput.value = String(parseAmount(match[1]));

            input.value = match[2].trim();

            const hint = $("expense-smart-hint");

            if (hint) {

                hint.textContent = `✓ ${formatMoney(amountInput.value)} уже у полі суми`;

                hint.classList.add("parsed");

            }

            updateInstallmentPreview();

        }

    }

    if ($("expense-clear-description")) {

        $("expense-clear-description").hidden = !input?.value;

    }

    predictExpense();

}

function toggleExpenseCategoryPicker(force) {

    const picker = $("expense-category-picker");

    if (!picker) return;

    const open = typeof force === "boolean" ? force : picker.hidden;

    picker.hidden = !open;

    $("expense-change-category")?.setAttribute("aria-expanded", String(open));

    if (open) {

        const manual = parseCategoryValue($("expense-category-select")?.value);

        const auto = detectCategoryOrDefault($("expense-description")?.value);

        expensePickerCategory = manual?.category || auto.category || "Інше";

        renderExpenseCategoryPicker();

        picker.scrollIntoView({ behavior: "smooth", block: "nearest" });

    }

}

function renderExpenseCategoryPicker() {

    const main = $("expense-main-categories");

    const sub = $("expense-subcategory-chips");

    if (!main || !sub) return;

    const selected = parseCategoryValue($("expense-category-select")?.value);

    main.replaceChildren(...Object.entries(categories).map(([name, info]) => {

        const button = document.createElement("button");

        button.type = "button";

        button.className = "expense-main-chip" + (expensePickerCategory === name ? " active" : "");

        button.textContent = `${info.icon} ${name}`;

        button.setAttribute("aria-pressed", String(expensePickerCategory === name));

        button.addEventListener("click", () => chooseExpenseMainCategory(name));

        return button;

    }));

    const subs = categories[expensePickerCategory]?.subcategories || {};

    sub.replaceChildren(...Object.entries(subs).map(([name, icon]) => {

        const button = document.createElement("button");

        button.type = "button";

        button.className = "expense-sub-chip" + (

            selected?.category === expensePickerCategory && selected.subcategory === name

                ? " active" : ""

        );

        button.textContent = `${icon} ${name}`;

        button.setAttribute("aria-pressed", String(

            selected?.category === expensePickerCategory && selected.subcategory === name

        ));

        button.addEventListener("click", () => chooseExpenseSubcategory(name));

        return button;

    }));

}

function chooseExpenseMainCategory(category) {

    if (!categories[category]) return;

    expensePickerCategory = category;

    const auto = detectCategoryOrDefault($("expense-description")?.value);

    const subcategories = Object.keys(categories[category].subcategories);

    const defaultSub = auto.category === category && subcategories.includes(auto.subcategory)

        ? auto.subcategory : subcategories[0];

    chooseExpenseSubcategory(defaultSub);

}

function chooseExpenseSubcategory(subcategory) {

    if (categories[expensePickerCategory]?.subcategories[subcategory] === undefined) return;

    $("expense-category-select").value = `${expensePickerCategory}|${subcategory}`;

    renderExpenseCategoryPicker();

    predictExpense();

}

function resetExpenseCategory() {

    const select = $("expense-category-select");

    if (select) select.value = "";

    expensePickerCategory = detectCategoryOrDefault($("expense-description")?.value).category;

    renderExpenseCategoryPicker();

    toggleExpenseCategoryPicker(false);

    predictExpense();

}

function predictExpense() {

    const description = ($("expense-description")?.value || "").trim();

    const prediction = $("expense-prediction");

    const resultEl = $("expense-prediction-result");

    const title = $("expense-prediction-title");

    const hint = $("expense-prediction-saving");

    if (!prediction || !resultEl || !title || !hint) return;

    const manual = parseCategoryValue($("expense-category-select")?.value);

    if (!description && !manual) {

        prediction.classList.remove("active", "needs-choice");

        $("expense-change-category")?.setAttribute("aria-expanded", "false");

        return;

    }

    const selected = manual || detectCategoryOrDefault(description);

    const matched = Boolean(manual || selected.matched);

    prediction.classList.toggle("needs-choice", !matched);

    prediction.classList.add("active");

    title.textContent = manual ? "✓ Обрано вручну" : selected.source === "rule"

        ? "✓ Запам’ятали твій вибір" : selected.matched

            ? "✓ Категорію підібрано" : "? Категорію не впізнали";

    resultEl.textContent = `${selected.icon} ${selected.category} → ${selected.subcategory}`;

    hint.textContent = manual

        ? "Можна зберегти цей вибір для наступних витрат із такою назвою."

        : selected.matched ? "Можеш зберігати — або натиснути «Змінити»."

            : "Якщо це не «Інше», натисни «Змінити» та обери правильну категорію.";

}

/* =========================================================

   PAGE NAVIGATION

   ========================================================= */

function showPage(page) {

    document.querySelectorAll(".page").forEach(element => {

        element.classList.remove("active");

    });

    const target = $(`page-${page}`);

    if (target) {

        target.classList.add("active");

    }

    document.querySelectorAll(".nav-item").forEach(item => {

        item.classList.remove("active");

        if (item.dataset.page === page) {

            item.classList.add("active");

        }

    });

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

    if (page === "settings") {

        renderSettings();

        renderSettingsExtras();

    }

    if (page === "home") {

        renderHome();

    }

    if (page === "transactions") {

        renderTransactions();

    }

    if (page === "analytics") {

        renderAnalytics();

    }

    if (page === "installments") {

        renderInstallments();

    }

    if (page === "budget") {

        renderBudgetPage();

        renderGoals();

    }

}

/* =========================================================

   HOME

   ========================================================= */

function getMonthExpenses(date = new Date()) {

    return getExpensesForMonth(date.getFullYear(), date.getMonth());

}

function getMonthIncome(date = new Date()) {

    return getIncomeTransactions().filter(item =>

        isSameMonth(item.date, date.getFullYear(), date.getMonth())

    );

}

function applyBudgetProgress(element, percent) {

    if (!element) return;

    element.style.width = `${Math.min(percent, 100)}%`;

    element.classList.remove("warning", "danger");

    if (percent >= 100) {

        element.classList.add("danger");

    } else if (percent >= 80) {

        element.classList.add("warning");

    }

}

function renderHome() {

    const now = new Date();

    const monthIncome = sumAmount(getMonthIncome(now));

    const monthExpenses = sumAmount(getMonthExpenses(now));

    const balance = monthIncome - monthExpenses;

    if ($("header-name")) {

        $("header-name").textContent = userName;

    }

    if ($("balance-value")) {

        $("balance-value").textContent = formatMoney(balance);

    }

    if ($("home-income")) {

        $("home-income").textContent = formatMoney(monthIncome);

    }

    if ($("home-expenses")) {

        $("home-expenses").textContent = formatMoney(monthExpenses);

    }

    renderHomeBudget();

    renderRecentTransactions();

    renderBackupBanner();

}

/* =========================================================

   HOME BUDGET (поточний місяць)

   ========================================================= */

function renderHomeBudget() {

    const spent = sumAmount(getMonthExpenses());

    const percent = budget > 0 ? (spent / budget) * 100 : 0;

    if ($("home-budget")) {

        $("home-budget").textContent = formatMoney(budget);

    }

    if ($("home-budget-percent")) {

        $("home-budget-percent").textContent = `${Math.round(percent)}%`;

        $("home-budget-percent").style.color =

            percent >= 100 ? "var(--red)"

            : percent >= 80 ? "var(--orange)"

            : "";

    }

    applyBudgetProgress($("home-budget-progress"), percent);

    if ($("home-budget-spent")) {

        $("home-budget-spent").textContent = formatMoney(spent);

    }

    if ($("home-budget-left")) {

        $("home-budget-left").textContent =

            budget > 0 ? formatMoney(budget - spent) : "—";

    }

}

/* =========================================================

   RECENT TRANSACTIONS

   ========================================================= */

function renderRecentTransactions() {

    const container = $("home-transactions");

    if (!container) return;

    const list = [...transactions]

        .filter(item => !item.deleted)

        .sort(

            (a, b) =>

                parseDate(b.date) - parseDate(a.date)

        )

        .slice(0, 5);

    if (!list.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">💸</div>

                <div class="empty-title">

                    Поки що немає операцій

                </div>

                <div class="empty-description">

                    Додай першу витрату або дохід

                </div>

            </div>

        `;

        return;

    }

    container.innerHTML = list

        .map(transactionHTML)

        .join("");

}

/* =========================================================

   TRANSACTION HTML

   ========================================================= */

function transactionHTML(transaction) {

    const isIncome = transaction.type === "income";

    const icon = isIncome

        ? "💰"

        : getCategoryIcon(

            transaction.category,

            transaction.subcategory

        );

    const categoryText = isIncome

        ? "Дохід"

        : `${transaction.category || "Інше"} → ${transaction.subcategory || ""}`;

    const amount = Number(transaction.amount || 0);

    return `

        <div

            class="transaction-card"

            onclick="openTransactionDetails('${escapeAttribute(transaction.id)}')"

        >

            <div class="transaction-icon">

                ${icon}

            </div>

            <div class="transaction-info">

                <div class="transaction-title">

                    ${escapeHTML(

                        transaction.description ||

                        (isIncome ? "Дохід" : "Витрата")

                    )}

                </div>

                <div class="transaction-category">

                    ${escapeHTML(categoryText)}

                </div>

                <div class="transaction-date">

                    ${formatDate(transaction.date)}

                </div>

            </div>

            <div class="transaction-amount ${isIncome ? "income" : "expense"}">

                ${isIncome ? "+" : "-"}${formatMoney(amount)}

            </div>

        </div>

    `;

}

/* =========================================================

   ESCAPE HTML

   ========================================================= */

function escapeHTML(value) {

    return String(value || "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}

/* =========================================================

   EXPENSE MODAL

   ========================================================= */

function buildDateFromInput(value) {

    const now = new Date();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {

        return now.toISOString();

    }

    if (value === toDateInputValue(now)) {

        return now.toISOString();

    }

    const [year, month, day] = value.split("-").map(Number);

    return new Date(

        year,

        month - 1,

        day,

        now.getHours(),

        now.getMinutes(),

        now.getSeconds()

    ).toISOString();

}

function openExpenseModal() {

    editingTransactionId = null;

    if ($("expense-amount")) {

        $("expense-amount").value = "";

    }

    if ($("expense-description")) {

        $("expense-description").value = "";

    }

    if ($("expense-prediction")) {

        $("expense-prediction").classList.remove("active");

    }

    if ($("expense-installment")) {

        $("expense-installment").checked = false;

    }

    if ($("installment-term")) {

        $("installment-term").value = "";

    }

    selectedInstallmentBank = "";

    document.querySelectorAll(".bank-option").forEach(item => {

        item.classList.remove("active");

    });

    if ($("expense-category-select")) {

        $("expense-category-select").value = "";

    }

    if ($("expense-category-picker")) $("expense-category-picker").hidden = true;

    if ($("expense-change-category")) $("expense-change-category").setAttribute("aria-expanded", "false");

    if ($("expense-remember-rule")) $("expense-remember-rule").checked = true;

    if ($("expense-clear-description")) $("expense-clear-description").hidden = true;

    if ($("expense-smart-hint")) {

        $("expense-smart-hint").innerHTML = 'Можна написати просто <strong>200 таксі</strong> в одному полі — суму заповнимо самі.';

        $("expense-smart-hint").classList.remove("parsed");

    }

    renderExpenseExamples();

    toggleInstallmentFields();

    updateInstallmentPreview();

    openModal("expense-modal");

}

function rememberExpenseCategory(description) {

    if (!$("expense-remember-rule")?.checked) return;

    const manual = parseCategoryValue($("expense-category-select")?.value);

    const auto = detectCategoryOrDefault(description);

    if (manual && (manual.category !== auto.category || manual.subcategory !== auto.subcategory)) {

        saveCustomRule(description, manual.category, manual.subcategory);

    }

}

/* =========================================================

   SAVE EXPENSE

   ========================================================= */

function saveExpense() {

    const amount = parseAmount($("expense-amount")?.value);

    const description = ($("expense-description")?.value || "").trim();

    if (amount <= 0) {

        showToast("⚠️", "Введи суму витрати");

        return;

    }

    if (!description) {

        showToast("⚠️", "Опиши, на що витратив гроші");

        return;

    }

    const auto = detectCategoryOrDefault(description);

    const manual = parseCategoryValue($("expense-category-select")?.value);

    const detected = manual || auto;

    const isInstallment = $("expense-installment")?.checked || false;

    if (isInstallment) {

        saveInstallmentPurchase(amount, description, detected);

        return;

    }

    rememberExpenseCategory(description);

    transactions.push({

        id: generateId(),

        type: "expense",

        amount,

        description,

        category: detected.category,

        subcategory: detected.subcategory,

        date: new Date().toISOString(),

        createdAt: new Date().toISOString()

    });

    saveData();

    closeModal("expense-modal");

    renderAll();

    showToast("✓", `${detected.category} → ${detected.subcategory}`);

}

/* =========================================================

   INCOME

   ========================================================= */

function openIncomeModal() {

    if ($("income-amount")) {

        $("income-amount").value = "";

    }

    if ($("income-description")) {

        $("income-description").value = "";

    }

    if ($("income-date")) {

        $("income-date").value = toDateInputValue(new Date());

    }

    openModal("income-modal");

}

function saveIncome() {

    const amount = parseAmount($("income-amount")?.value);

    const description =

        ($("income-description")?.value || "").trim() || "Дохід";

    if (amount <= 0) {

        showToast("⚠️", "Введи суму доходу");

        return;

    }

    transactions.push({

        id: generateId(),

        type: "income",

        amount,

        description,

        date: buildDateFromInput($("income-date")?.value),

        createdAt: new Date().toISOString()

    });

    saveData();

    closeModal("income-modal");

    renderAll();

    showToast("💰", `Додано ${formatMoney(amount)}`);

}

/* =========================================================

   INSTALLMENT TOGGLE

   ========================================================= */

function toggleInstallmentFields() {

    const checkbox = $("expense-installment");

    const fields = $("installment-fields");

    if (!checkbox || !fields) return;

    if (checkbox.checked) {

        fields.classList.add("active");

        updateInstallmentPreview();

    } else {

        fields.classList.remove("active");

    }

}

/* =========================================================

   SELECT BANK

   ========================================================= */

function selectInstallmentBank(bank) {

    selectedInstallmentBank = bank;

    document.querySelectorAll(".bank-option").forEach(option => {

        option.classList.remove("active");

    });

    const selected = document.querySelector(

        `.bank-option[data-bank="${bank}"]`

    );

    if (selected) {

        selected.classList.add("active");

    }

    updateInstallmentPreview();

}

/* =========================================================

   INSTALLMENT PREVIEW

   ========================================================= */

function updateInstallmentPreview() {

    const amount = parseAmount($("expense-amount")?.value);

    const term = Number($("installment-term")?.value || 0);

    if ($("installment-monthly-payment")) {

        $("installment-monthly-payment").textContent =

            term >= 2 ? formatMoney(amount / term) : "—";

    }

    if ($("installment-preview")) {

        $("installment-preview").style.display =

            amount > 0 ? "flex" : "none";

    }

}

/* =========================================================

   SAVE INSTALLMENT

   ========================================================= */

function saveInstallmentPurchase(

    amount,

    description,

    detected

) {

    const term = Number(

        $("installment-term")?.value || 0

    );

    if (!selectedInstallmentBank) {

        showToast(

            "⚠️",

            "Обери банк"

        );

        return;

    }

    if (term < 2 || term > 24) {

        showToast(

            "⚠️",

            "Обери термін оплати"

        );

        return;

    }

    const monthlyPayment =

        Math.round(

            (amount / term) * 100

        ) / 100;

    const installment = {

        id: generateId(),

        amount,

        description,

        category: detected.category,

        subcategory: detected.subcategory,

        bank: selectedInstallmentBank,

        term,

        monthlyPayment,

        paidMonths: 0,

        startDate: new Date().toISOString(),

        payments: []

    };

    rememberExpenseCategory(description);

    installments.push(installment);

    saveData();

    closeModal("expense-modal");

    renderAll();

    showToast(

        "✓",

        `ОЧ створено: ${formatMoney(monthlyPayment)}/міс.`

    );

}

/* =========================================================

   INSTALLMENT PAGE

   ========================================================= */

function renderInstallments() {

    const container = $("installments-list");

    if (!container) return;

    if ($("installments-count")) {

        $("installments-count").textContent =

            `${installments.length} покупок`;

    }

    renderBankCards();

    if (!installments.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">💳</div>

                <div class="empty-title">

                    Немає покупок в ОЧ

                </div>

                <div class="empty-description">

                    Під час створення витрати

                    можна оформити її в оплату частинами

                </div>

            </div>

        `;

        return;

    }

    container.innerHTML = installments

        .slice()

        .reverse()

        .map(installmentHTML)

        .join("");

}

/* =========================================================

   BANK CARDS

   ========================================================= */

function renderBankCards() {

    const container = $("installment-banks");

    if (!container) return;

    const banks = [

        {

            id: "privat",

            name: "Приват",

            icon: "P"

        },

        {

            id: "pumb",

            name: "ПУМБ",

            icon: "П"

        },

        {

            id: "mono",

            name: "mono",

            icon: "M"

        }

    ];

    container.innerHTML = banks.map(bank => `

        <button

            class="bank-card"

            onclick="openInstallmentBank('${bank.id}')"

        >

            <div class="bank-logo">

                ${bank.icon}

            </div>

            <div class="bank-name">

                ${bank.name}

            </div>

        </button>

    `).join("");

}

/* =========================================================

   BANK FILTER

   ========================================================= */

function openInstallmentBank(bank) {

    const filtered = installments.filter(

        item => item.bank === bank

    );

    const container = $("installments-list");

    if (!container) return;

    if (!filtered.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">💳</div>

                <div class="empty-title">

                    Немає покупок

                </div>

                <div class="empty-description">

                    Для цього банку ще немає активних ОЧ

                </div>

                <button

                    class="primary-button"

                    style="margin-top:15px;"

                    onclick="renderInstallments()"

                >

                    Показати всі

                </button>

            </div>

        `;

        return;

    }

    container.innerHTML = filtered

        .slice()

        .reverse()

        .map(installmentHTML)

        .join("");

}

/* =========================================================

   INSTALLMENT HTML

   ========================================================= */

function installmentHTML(item) {

    const paid = Number(item.paidMonths || 0);

    const total = Number(item.term || 1);

    const percent = Math.min(

        (paid / total) * 100,

        100

    );

    const remaining =

        Math.max(total - paid, 0);

    const bankName = {

        privat: "ПриватБанк",

        pumb: "ПУМБ",

        mono: "Monobank"

    }[item.bank] || item.bank;

    const canPay = paid < total;

    return `

        <div class="installment-card">

            <div class="installment-top">

                <div class="installment-icon">

                    ${getCategoryIcon(

                        item.category,

                        item.subcategory

                    )}

                </div>

                <div class="installment-info">

                    <div class="installment-title">

                        ${escapeHTML(item.description)}

                    </div>

                    <div class="installment-bank">

                        ${bankName}

                        •

                        ${item.term} міс.

                    </div>

                </div>

                <div class="installment-price">

                    <div class="installment-monthly">

                        ${formatMoney(item.monthlyPayment)}

                    </div>

                    <div class="installment-total">

                        / місяць

                    </div>

                </div>

            </div>

            <div class="installment-progress">

                <div class="installment-progress-top">

                    <span>

                        ${paid} з ${total} платежів

                    </span>

                    <span>

                        ${formatMoney(

                            Math.max(

                                item.amount -

                                item.monthlyPayment * paid,

                                0

                            )

                        )}

                    </span>

                </div>

                <div class="installment-progress-bar">

                    <div

                        class="installment-progress-fill"

                        style="width:${percent}%"

                    ></div>

                </div>

            </div>

            <div class="installment-actions">

                ${

                    canPay

                        ? `

                            <button

                                class="primary-button"

                                onclick="payInstallment('${item.id}')"

                            >

                                ✓ Оплатити цей місяць

                            </button>

                        `

                        : `

                            <button

                                class="secondary-button"

                                disabled

                            >

                                ✓ Повністю оплачено

                            </button>

                        `

                }

                <button

                    class="secondary-button"

                    onclick="showInstallmentInfo('${item.id}')"

                >

                    Деталі

                </button>

            </div>

        </div>

    `;

}

/* =========================================================

   PAY INSTALLMENT

   ========================================================= */

function payInstallment(id) {

    const installment = installments.find(

        item => item.id === id

    );

    if (!installment) return;

    if (

        Number(installment.paidMonths || 0) >=

        Number(installment.term)

    ) {

        showToast(

            "✓",

            "Цю покупку вже повністю оплачено"

        );

        return;

    }

    const now = new Date();

    const monthKey = getMonthKey(now);

    const alreadyPaidThisMonth =

        installment.payments?.some(

            payment =>

                payment.monthKey === monthKey

        );

    if (alreadyPaidThisMonth) {

        showToast(

            "ℹ️",

            "Платіж за цей місяць уже оплачений"

        );

        return;

    }

    const paymentNumber =

        Number(installment.paidMonths || 0) + 1;

    if (!installment.payments) {

        installment.payments = [];

    }

    installment.payments.push({

        id: generateId(),

        paymentNumber,

        amount: installment.monthlyPayment,

        date: now.toISOString(),

        monthKey

    });

    installment.paidMonths = paymentNumber;

    /*

       ВАЖЛИВО:

       Тут ми НЕ записуємо всю покупку amount.

       Витратою стає лише фактично оплачений

       місячний платіж.

    */

    transactions.push({

        id: generateId(),

        type: "expense",

        amount: installment.monthlyPayment,

        description:

            `${installment.description} — платіж ${paymentNumber}/${installment.term}`,

        category: installment.category,

        subcategory: installment.subcategory,

        installmentId: installment.id,

        installmentPayment: true,

        installmentPaymentNumber:

            paymentNumber,

        date: now.toISOString(),

        createdAt: now.toISOString()

    });

    saveData();

    renderAll();

    showToast(

        "✓",

        `Платіж ${paymentNumber}/${installment.term} оплачено`

    );

}

/* =========================================================

   INSTALLMENT DETAILS

   ========================================================= */

function showInstallmentInfo(id) {

    const item = installments.find(

        installment => installment.id === id

    );

    if (!item) return;

    const paid = Number(item.paidMonths || 0);

    const remaining =

        Math.max(

            item.term - paid,

            0

        );

    const remainingAmount =

        Math.max(

            item.amount -

            item.monthlyPayment * paid,

            0

        );

    const bankName = {

        privat: "ПриватБанк",

        pumb: "ПУМБ",

        mono: "Monobank"

    }[item.bank] || item.bank;

    if ($("installment-info-content")) {

        $("installment-info-content").innerHTML = `

            <div class="transaction-card">

                <div class="transaction-icon">

                    ${getCategoryIcon(

                        item.category,

                        item.subcategory

                    )}

                </div>

                <div class="transaction-info">

                    <div class="transaction-title">

                        ${escapeHTML(item.description)}

                    </div>

                    <div class="transaction-category">

                        ${item.category}

                        →

                        ${item.subcategory}

                    </div>

                </div>

            </div>

            <div class="divider"></div>

            <p>

                <strong>Банк:</strong>

                ${bankName}

            </p>

            <p style="margin-top:8px;">

                <strong>Повна сума:</strong>

                ${formatMoney(item.amount)}

            </p>

            <p style="margin-top:8px;">

                <strong>Щомісячний платіж:</strong>

                ${formatMoney(item.monthlyPayment)}

            </p>

            <p style="margin-top:8px;">

                <strong>Термін:</strong>

                ${item.term} місяців

            </p>

            <p style="margin-top:8px;">

                <strong>Оплачено:</strong>

                ${paid} / ${item.term}

            </p>

            <p style="margin-top:8px;">

                <strong>Залишилось:</strong>

                ${remaining} платежів

            </p>

            <p style="margin-top:8px;">

                <strong>Залишилось оплатити:</strong>

                ${formatMoney(remainingAmount)}

            </p>

        `;

    }

    openModal("installment-info-modal");

}

/* =========================================================

   TRANSACTIONS PAGE

   ========================================================= */

function renderTransactions() {

    const container = $("transactions-list");

    if (!container) return;

    let list = transactions.filter(

        item => !item.deleted

    );

    const search =

        $("transaction-search")?.value

            .toLowerCase()

            .trim() || "";

    if (search) {

        list = list.filter(item =>

            String(item.description || "")

                .toLowerCase()

                .includes(search)

        );

    }

    if (currentTransactionType !== "all") {

        list = list.filter(

            item =>

                item.type === currentTransactionType

        );

    }

    if (currentCategoryFilter !== "all") {

        list = list.filter(

            item =>

                item.category === currentCategoryFilter

        );

    }

    list.sort(

        (a, b) =>

            parseDate(b.date) - parseDate(a.date)

    );

    const expenses = list.filter(

        item => item.type === "expense"

    );

    const total = expenses.reduce(

        (sum, item) =>

            sum + Number(item.amount || 0),

        0

    );

    if ($("operations-count")) {

        $("operations-count").textContent =

            `${list.length} операцій`;

    }

    if ($("operations-total")) {

        $("operations-total").textContent =

            formatMoney(total);

    }

    if (!list.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">🔎</div>

                <div class="empty-title">

                    Нічого не знайдено

                </div>

                <div class="empty-description">

                    Спробуй змінити фільтри

                </div>

            </div>

        `;

        return;

    }

    container.innerHTML =

        list.map(transactionHTML).join("");

}

/* =========================================================

   TRANSACTION FILTERS

   ========================================================= */

function setTransactionTypeFilter(type) {

    currentTransactionType = type;

    document

        .querySelectorAll("[data-type-filter]")

        .forEach(button => {

            button.classList.toggle(

                "active",

                button.dataset.typeFilter === type

            );

        });

    renderTransactions();

}

function setCategoryFilter(category) {

    currentCategoryFilter = category;

    document

        .querySelectorAll("[data-category-filter]")

        .forEach(button => {

            button.classList.toggle(

                "active",

                button.dataset.categoryFilter === category

            );

        });

    renderTransactions();

}

function applyTransactionFilters() {

    renderTransactions();

}

/* =========================================================

   TRANSACTION DETAILS

   ========================================================= */

function openTransactionDetails(id) {

    const transaction = transactions.find(

        item => item.id === id

    );

    if (!transaction) return;

    const isIncome =

        transaction.type === "income";

    const category = isIncome

        ? "Дохід"

        : `${transaction.category || "Інше"} → ${transaction.subcategory || ""}`;

    if ($("transaction-details")) {

        $("transaction-details").innerHTML = `

            <div class="transaction-card">

                <div class="transaction-icon">

                    ${

                        isIncome

                            ? "💰"

                            : getCategoryIcon(

                                transaction.category,

                                transaction.subcategory

                            )

                    }

                </div>

                <div class="transaction-info">

                    <div class="transaction-title">

                        ${escapeHTML(

                            transaction.description ||

                            "Операція"

                        )}

                    </div>

                    <div class="transaction-category">

                        ${escapeHTML(category)}

                    </div>

                    <div class="transaction-date">

                        ${formatDate(transaction.date)}

                    </div>

                </div>

                <div

                    class="transaction-amount ${

                        isIncome

                            ? "income"

                            : "expense"

                    }"

                >

                    ${

                        isIncome

                            ? "+"

                            : "-"

                    }${formatMoney(transaction.amount)}

                </div>

            </div>

            ${

                transaction.installmentPayment

                    ? `

                        <div class="prediction active">

                            <div class="prediction-label">

                                ОПЛАТА ЧАСТИНАМИ

                            </div>

                            <div class="prediction-result">

                                Платіж

                                ${transaction.installmentPaymentNumber}

                            </div>

                        </div>

                    `

                    : ""

            }

            <div style="margin-top:18px;">

                <button

                    class="secondary-button"

                    onclick="openEditTransaction('${escapeAttribute(transaction.id)}')"

                >

                    ✏️ Редагувати

                </button>

            </div>

            <div style="margin-top:10px;">

                <button

                    class="danger-button"

                    onclick="deleteTransaction('${transaction.id}')"

                >

                    Видалити операцію

                </button>

            </div>

        `;

    }

    openModal("details-modal");

}

/* =========================================================

   DELETE TRANSACTION

   ========================================================= */

/* =========================================================

   EDIT TRANSACTION (сума, опис, дата)

   ========================================================= */

function toDateInputValue(value) {

    const date = parseDate(value);

    return `${date.getFullYear()}-${String(

        date.getMonth() + 1

    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

}

function openEditTransaction(id) {

    const transaction = transactions.find(item => item.id === id);

    if (!transaction) return;

    editingTransactionId = id;

    if ($("edit-title")) {

        $("edit-title").textContent =

            transaction.type === "income"

                ? "Редагувати дохід"

                : "Редагувати витрату";

    }

    $("edit-amount").value = String(transaction.amount).replace(".", ",");

    $("edit-description").value = transaction.description || "";

    $("edit-date").value = toDateInputValue(transaction.date);

    const categoryGroup = $("edit-category-group");

    const categorySelect = $("edit-category-select");

    if (categoryGroup && categorySelect) {

        const isExpense =

            transaction.type === "expense" && !transaction.installmentPayment;

        categoryGroup.style.display = isExpense ? "" : "none";

        if (isExpense) {

            const current = `${transaction.category}|${transaction.subcategory}`;

            const known =

                categories[transaction.category] &&

                categories[transaction.category].subcategories[

                    transaction.subcategory

                ] !== undefined;

            categorySelect.innerHTML =

                (known

                    ? ""

                    : `<option value="${escapeAttribute(current)}">${escapeHTML(

                          transaction.category + " → " + transaction.subcategory

                      )}</option>`) + categoryOptionsHTML(false);

            categorySelect.value = current;

        }

    }

    closeModal("details-modal");

    openModal("edit-modal");

}

function saveEditedTransaction() {

    const transaction = transactions.find(

        item => item.id === editingTransactionId

    );

    if (!transaction) return;

    const amount = parseAmount($("edit-amount")?.value);

    const description = ($("edit-description")?.value || "").trim();

    const dateValue = $("edit-date")?.value || "";

    if (amount <= 0) {

        showToast("⚠️", "Введи суму");

        return;

    }

    if (!description) {

        showToast("⚠️", "Введи опис");

        return;

    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {

        showToast("⚠️", "Обери дату");

        return;

    }

    transaction.amount = amount;

    /* Категорія: ручний вибір має пріоритет (і запам'ятовується),

       інакше — перевизначаємо, лише якщо змінився опис */

    if (

        transaction.type === "expense" &&

        !transaction.installmentPayment

    ) {

        const chosen = parseCategoryValue($("edit-category-select")?.value);

        const originalKey = `${transaction.category}|${transaction.subcategory}`;

        if (

            chosen &&

            `${chosen.category}|${chosen.subcategory}` !== originalKey

        ) {

            transaction.category = chosen.category;

            transaction.subcategory = chosen.subcategory;

            saveCustomRule(description, chosen.category, chosen.subcategory);

        } else if (description !== transaction.description) {

            const detected = detectCategoryOrDefault(description);

            transaction.category = detected.category;

            transaction.subcategory = detected.subcategory;

        }

    }

    transaction.description = description;

    /* Дату міняємо лише якщо вона справді змінилась; час доби зберігаємо */

    if (dateValue !== toDateInputValue(transaction.date)) {

        const [year, month, day] = dateValue.split("-").map(Number);

        const old = parseDate(transaction.date);

        transaction.date = new Date(

            year,

            month - 1,

            day,

            old.getHours(),

            old.getMinutes(),

            old.getSeconds()

        ).toISOString();

    }

    transaction.updatedAt = new Date().toISOString();

    saveData();

    closeModal("edit-modal");

    editingTransactionId = null;

    renderAll();

    showToast("✓", "Зміни збережено");

}

function deleteTransaction(id) {

    const index = transactions.findIndex(item => item.id === id);

    if (index === -1) return;

    const transaction = transactions[index];

    let removedPayment = null;

    let installmentId = null;

    /* Платіж за розстрочкою — відкочуємо його в самій розстрочці */

    if (transaction.installmentPayment && transaction.installmentId) {

        const installment = installments.find(

            item => item.id === transaction.installmentId

        );

        if (installment) {

            installmentId = installment.id;

            removedPayment =

                (installment.payments || []).find(

                    payment =>

                        payment.paymentNumber ===

                        transaction.installmentPaymentNumber

                ) || null;

            installment.payments = (installment.payments || []).filter(

                payment =>

                    payment.paymentNumber !==

                    transaction.installmentPaymentNumber

            );

            installment.paidMonths = installment.payments.length;

        }

    }

    transactions.splice(index, 1);

    saveData();

    closeModal("details-modal");

    renderAll();

    showToast("🗑️", "Операцію видалено", {

        label: "Скасувати",

        duration: 6000,

        handler: () => {

            transactions.push(transaction);

            if (removedPayment && installmentId) {

                const installment = installments.find(

                    item => item.id === installmentId

                );

                if (installment) {

                    installment.payments.push(removedPayment);

                    installment.payments.sort(

                        (a, b) => a.paymentNumber - b.paymentNumber

                    );

                    installment.paidMonths = installment.payments.length;

                }

            }

            saveData();

            renderAll();

            showToast("↩️", "Операцію повернуто");

        }

    });

}

/* =========================================================

   ANALYTICS

   ========================================================= */

function changeAnalyticsMonth(direction) {

    /* Завжди 1-ше число, щоб 31-го не "перестрибувати" місяці */

    analyticsDate = new Date(

        analyticsDate.getFullYear(),

        analyticsDate.getMonth() + direction,

        1

    );

    selectedAnalyticsCategory = null;

    renderAnalytics();

}

function setAnalyticsMode(mode) {

    analyticsMode = mode;

    if ($("analytics-mode-month")) {

        $("analytics-mode-month")

            .classList.toggle(

                "active",

                mode === "month"

            );

    }

    if ($("analytics-mode-compare")) {

        $("analytics-mode-compare")

            .classList.toggle(

                "active",

                mode === "compare"

            );

    }

    renderAnalytics();

}

/* =========================================================

   MONTH EXPENSES

   ========================================================= */

function getExpensesForMonth(year, month) {

    return getExpenses().filter(

        item =>

            isSameMonth(

                item.date,

                year,

                month

            )

    );

}

/* =========================================================

   ANALYTICS RENDER

   ========================================================= */

function renderAnalytics() {

    const year =

        analyticsDate.getFullYear();

    const month =

        analyticsDate.getMonth();

    if ($("analytics-month-title")) {

        $("analytics-month-title").textContent =

            `${MONTHS[month]} ${year}`;

    }

    if (

        analyticsMode === "compare"

    ) {

        renderComparison();

        if ($("monthly-analytics-content")) {

            $("monthly-analytics-content").style.display =

                "none";

        }

        if ($("comparison-section")) {

            $("comparison-section").style.display =

                "block";

        }

        return;

    }

    if ($("monthly-analytics-content")) {

        $("monthly-analytics-content").style.display =

            "block";

    }

    if ($("comparison-section")) {

        $("comparison-section").style.display =

            "none";

    }

    const expenses =

        getExpensesForMonth(

            year,

            month

        );

    const total = expenses.reduce(

        (sum, item) =>

            sum + Number(item.amount || 0),

        0

    );

    const average =

        expenses.length

            ? total / expenses.length

            : 0;

    const biggest =

        expenses.length

            ? Math.max(

                ...expenses.map(

                    item =>

                        Number(item.amount || 0)

                )

            )

            : 0;

    if ($("analytics-total")) {

        $("analytics-total").textContent =

            formatMoney(total);

    }

    if ($("analytics-month-description")) {

        $("analytics-month-description").textContent =

            `${expenses.length} витрат за місяць`;

    }

    if ($("analytics-average")) {

        $("analytics-average").textContent =

            formatMoney(average);

    }

    if ($("analytics-biggest")) {

        $("analytics-biggest").textContent =

            formatMoney(biggest);

    }

    renderAnalyticsInsights(expenses);

    renderAnalyticsCategories(expenses);

    renderAnalyticsCategoryDetails(expenses);

    renderDailyChart(expenses);

    renderTopSubcategories(expenses);

    renderSavingPotential(expenses);

}

/* =========================================================

   ANALYTICS INSIGHTS

   ========================================================= */

function renderAnalyticsInsights(expenses) {

    const container = $("analytics-insights");

    if (!container) return;

    if (!expenses.length) {

        container.innerHTML = `

            <div class="insight-card">

                <div class="insight-icon">

                    📊

                </div>

                <div class="insight-text">

                    За цей місяць ще немає витрат.

                    Додай першу операцію, щоб побачити аналіз.

                </div>

            </div>

        `;

        return;

    }

    const total = expenses.reduce(

        (sum, item) =>

            sum + Number(item.amount || 0),

        0

    );

    const categoryTotals = {};

    expenses.forEach(item => {

        categoryTotals[item.category] =

            (categoryTotals[item.category] || 0) +

            Number(item.amount || 0);

    });

    const sorted =

        Object.entries(categoryTotals)

            .sort((a, b) => b[1] - a[1]);

    const biggestCategory =

        sorted[0];

    const percent =

        biggestCategory

            ? Math.round(

                (biggestCategory[1] / total) * 100

            )

            : 0;

    container.innerHTML = `

        <div class="insight-card">

            <div class="insight-icon">

                🔎

            </div>

            <div class="insight-text">

                Найбільша категорія цього місяця —

                <strong>

                    ${escapeHTML(biggestCategory?.[0] || "—")}

                </strong>.

                На неї припадає приблизно

                ${percent}% усіх витрат.

            </div>

        </div>

        <div class="insight-card">

            <div class="insight-icon">

                💰

            </div>

            <div class="insight-text">

                Середня витрата:

                <strong>

                    ${formatMoney(

                        total / expenses.length

                    )}

                </strong>

                за операцію.

            </div>

        </div>

    `;

}

/* =========================================================

   ANALYTICS CATEGORIES

   ========================================================= */

function renderAnalyticsCategories(expenses) {

    const container =

        $("analytics-categories");

    if (!container) return;

    const total = expenses.reduce(

        (sum, item) =>

            sum + Number(item.amount || 0),

        0

    );

    const categoryTotals = {};

    expenses.forEach(item => {

        const category =

            item.category || "Інше";

        categoryTotals[category] =

            (categoryTotals[category] || 0) +

            Number(item.amount || 0);

    });

    const entries =

        Object.entries(categoryTotals)

            .sort((a, b) => b[1] - a[1]);

    if (!entries.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">📊</div>

                <div class="empty-title">

                    Немає даних

                </div>

                <div class="empty-description">

                    Тут з'явиться розподіл витрат

                </div>

            </div>

        `;

        return;

    }

    container.innerHTML = entries.map(

        ([category, amount]) => {

            const percent =

                total > 0

                    ? Math.round(

                        (amount / total) * 100

                    )

                    : 0;

            const icon =

                categories[category]?.icon ||

                "💰";

            const count =

                expenses.filter(

                    item =>

                        item.category === category

                ).length;

            return `

                <div

                    class="category-card"

                    onclick="selectAnalyticsCategory('${escapeAttribute(category)}')"

                >

                    <div class="category-main">

                        <div class="category-icon">

                            ${icon}

                        </div>

                        <div class="category-info">

                            <div class="category-name">

                                ${escapeHTML(category)}

                            </div>

                            <div class="category-subtitle">

                                ${count} операцій

                            </div>

                        </div>

                        <div>

                            <div class="category-amount">

                                ${formatMoney(amount)}

                            </div>

                            <div class="category-percent">

                                ${percent}%

                            </div>

                        </div>

                    </div>

                </div>

            `;

        }

    ).join("");

}

/* =========================================================

   CATEGORY DETAILS

   ========================================================= */

function selectAnalyticsCategory(category) {

    selectedAnalyticsCategory =

        category;

    const expenses =

        getExpensesForMonth(

            analyticsDate.getFullYear(),

            analyticsDate.getMonth()

        );

    renderAnalyticsCategoryDetails(

        expenses

    );

    const element =

        $("analytics-category-details");

    if (element) {

        element.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }

}

function renderAnalyticsCategoryDetails(expenses) {

    const container =

        $("analytics-category-details");

    if (!container) return;

    if (!selectedAnalyticsCategory) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">👆</div>

                <div class="empty-title">

                    Обери категорію

                </div>

                <div class="empty-description">

                    Натисни на категорію вище,

                    щоб побачити підкатегорії

                </div>

            </div>

        `;

        return;

    }

    const filtered =

        expenses.filter(

            item =>

                item.category ===

                selectedAnalyticsCategory

        );

    if (!filtered.length) {

        container.innerHTML = "";

        return;

    }

    const total =

        filtered.reduce(

            (sum, item) =>

                sum + Number(item.amount || 0),

            0

        );

    const subcategories = {};

    filtered.forEach(item => {

        const sub =

            item.subcategory || "Інше";

        subcategories[sub] =

            (subcategories[sub] || 0) +

            Number(item.amount || 0);

    });

    const icon =

        categories[

            selectedAnalyticsCategory

        ]?.icon || "💰";

    container.innerHTML = `

        <div class="section-header">

            <div class="section-title">

                ${icon}

                ${escapeHTML(

                    selectedAnalyticsCategory

                )}

            </div>

            <div class="section-action">

                ${formatMoney(total)}

            </div>

        </div>

        <div class="category-details">

            ${Object.entries(subcategories)

                .sort((a, b) => b[1] - a[1])

                .map(([subcategory, amount]) => `

                    <div class="subcategory-card">

                        <div class="subcategory-left">

                            <div class="subcategory-icon">

                                ${getCategoryIcon(

                                    selectedAnalyticsCategory,

                                    subcategory

                                )}

                            </div>

                            <div class="subcategory-name">

                                ${escapeHTML(

                                    subcategory

                                )}

                            </div>

                        </div>

                        <div class="subcategory-amount">

                            ${formatMoney(amount)}

                        </div>

                    </div>

                `)

                .join("")}

        </div>

    `;

}

/* =========================================================

   DAILY CHART

   ========================================================= */

function renderDailyChart(expenses) {

    const container =

        $("analytics-daily-chart");

    if (!container) return;

    const year =

        analyticsDate.getFullYear();

    const month =

        analyticsDate.getMonth();

    const days =

        new Date(

            year,

            month + 1,

            0

        ).getDate();

    const daily = {};

    for (let day = 1; day <= days; day++) {

        daily[day] = 0;

    }

    expenses.forEach(item => {

        const date =

            parseDate(item.date);

        const day =

            date.getDate();

        daily[day] =

            (daily[day] || 0) +

            Number(item.amount || 0);

    });

    const max =

        Math.max(

            ...Object.values(daily),

            1

        );

    container.innerHTML =

        Object.entries(daily)

            .map(([day, amount]) => {

                const height =

                    amount > 0

                        ? Math.max(

                            4,

                            (amount / max) * 130

                        )

                        : 3;

                return `

                    <div class="chart-column">

                        <div

                            class="chart-bar"

                            style="height:${height}px"

                            title="${formatMoney(amount)}"

                        ></div>

                        <div class="chart-day">

                            ${day}

                        </div>

                    </div>

                `;

            })

            .join("");

}

/* =========================================================

   TOP SUBCATEGORIES

   ========================================================= */

function renderTopSubcategories(expenses) {

    const container =

        $("analytics-subcategories");

    if (!container) return;

    const totals = {};

    expenses.forEach(item => {

        const sub =

            item.subcategory || "Інше";

        totals[sub] =

            (totals[sub] || 0) +

            Number(item.amount || 0);

    });

    const entries =

        Object.entries(totals)

            .sort((a, b) => b[1] - a[1])

            .slice(0, 8);

    if (!entries.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">📊</div>

                <div class="empty-title">

                    Немає підкатегорій

                </div>

            </div>

        `;

        return;

    }

    const max =

        entries[0][1];

    container.innerHTML =

        entries.map(

            ([name, amount]) => {

                const percent =

                    (amount / max) * 100;

                return `

                    <div class="subcategory-progress-card">

                        <div class="subcategory-progress-top">

                            <span>

                                ${escapeHTML(name)}

                            </span>

                            <span>

                                ${formatMoney(amount)}

                            </span>

                        </div>

                        <div class="subcategory-progress">

                            <div

                                class="subcategory-progress-fill"

                                style="width:${percent}%"

                            ></div>

                        </div>

                    </div>

                `;

            }

        ).join("");

}

/* =========================================================

   SAVING POTENTIAL

   ========================================================= */

function renderSavingPotential(expenses) {

    const container =

        $("analytics-saving-potential");

    if (!container) return;

    const totals = {};

    expenses.forEach(item => {

        const category =

            item.category || "Інше";

        totals[category] =

            (totals[category] || 0) +

            Number(item.amount || 0);

    });

    const entries =

        Object.entries(totals)

            .sort((a, b) => b[1] - a[1]);

    if (!entries.length) {

        container.innerHTML = "";

        return;

    }

    container.innerHTML =

        entries.map(

            ([category, amount]) => {

                const data =

                    categories[category];

                return `

                    <div class="saving-card">

                        <div class="saving-icon">

                            ${data?.icon || "💰"}

                        </div>

                        <div class="saving-info">

                            <div class="saving-name">

                                ${escapeHTML(category)}

                            </div>

                            <div class="saving-level">

                                Потенціал економії:

                                ${data?.saving || "Невідомо"}

                            </div>

                        </div>

                        <div class="saving-amount">

                            ${formatMoney(amount)}

                        </div>

                    </div>

                `;

            }

        ).join("");

}

/* =========================================================

   COMPARISON

   ========================================================= */

function renderComparison() {

    const currentYear =

        analyticsDate.getFullYear();

    const currentMonth =

        analyticsDate.getMonth();

    const previousDate =

        new Date(

            currentYear,

            currentMonth - 1,

            1

        );

    const previousYear =

        previousDate.getFullYear();

    const previousMonth =

        previousDate.getMonth();

    const currentExpenses =

        getExpensesForMonth(

            currentYear,

            currentMonth

        );

    const previousExpenses =

        getExpensesForMonth(

            previousYear,

            previousMonth

        );

    const currentTotal =

        currentExpenses.reduce(

            (sum, item) =>

                sum + Number(item.amount || 0),

            0

        );

    const previousTotal =

        previousExpenses.reduce(

            (sum, item) =>

                sum + Number(item.amount || 0),

            0

        );

    const difference =

        currentTotal - previousTotal;

    let percent = 0;

    if (previousTotal > 0) {

        percent =

            (difference / previousTotal) * 100;

    }

    if ($("comparison-current-month")) {

        $("comparison-current-month").textContent =

            `${MONTHS[currentMonth]} ${currentYear}`;

    }

    if ($("comparison-previous-month")) {

        $("comparison-previous-month").textContent =

            `${MONTHS[previousMonth]} ${previousYear}`;

    }

    if ($("comparison-difference")) {

        $("comparison-difference").className =

            "comparison-difference " +

            (difference > 0 ? "positive" : difference < 0 ? "negative" : "neutral");

        $("comparison-difference").textContent =

            `${difference >= 0 ? "+" : ""}${formatMoney(difference)}`;

    }

    if ($("comparison-percent")) {

        $("comparison-percent").textContent =

            previousTotal > 0

                ? `${difference >= 0 ? "+" : ""}${percent.toFixed(1)}%`

                : "Немає даних за минулий місяць";

    }

    if ($("comparison-message")) {

        if (difference < 0) {

            $("comparison-message").textContent =

                `У цьому місяці витрачено на ${formatMoney(

                    Math.abs(difference)

                )} менше, ніж минулого місяця.`;

        } else if (difference > 0) {

            $("comparison-message").textContent =

                `У цьому місяці витрачено на ${formatMoney(

                    difference

                )} більше, ніж минулого місяця.`;

        } else {

            $("comparison-message").textContent =

                "Витрати залишилися на тому ж рівні.";

        }

    }

    if ($("comparison-current-total")) {

        $("comparison-current-total").textContent =

            formatMoney(currentTotal);

    }

    if ($("comparison-previous-total")) {

        $("comparison-previous-total").textContent =

            formatMoney(previousTotal);

    }

    renderComparisonCategories(

        currentExpenses,

        previousExpenses

    );

}

/* =========================================================

   COMPARISON CATEGORIES

   ========================================================= */

function renderComparisonCategories(

    currentExpenses,

    previousExpenses

) {

    const container =

        $("comparison-categories");

    if (!container) return;

    const current = {};

    const previous = {};

    currentExpenses.forEach(item => {

        current[item.category] =

            (current[item.category] || 0) +

            Number(item.amount || 0);

    });

    previousExpenses.forEach(item => {

        previous[item.category] =

            (previous[item.category] || 0) +

            Number(item.amount || 0);

    });

    const categoriesSet =

        new Set([

            ...Object.keys(current),

            ...Object.keys(previous)

        ]);

    const entries =

        [...categoriesSet]

            .map(category => ({

                category,

                current: current[category] || 0,

                previous: previous[category] || 0,

                difference:

                    (current[category] || 0) -

                    (previous[category] || 0)

            }))

            .sort(

                (a, b) =>

                    Math.abs(b.difference) -

                    Math.abs(a.difference)

            );

    container.innerHTML =

        entries.map(item => `

            <div class="subcategory-card">

                <div class="subcategory-left">

                    <div class="subcategory-icon">

                        ${

                            categories[

                                item.category

                            ]?.icon || "💰"

                        }

                    </div>

                    <div>

                        <div class="subcategory-name">

                            ${escapeHTML(

                                item.category

                            )}

                        </div>

                        <div

                            style="

                                color:var(--text-muted);

                                font-size:10px;

                                margin-top:3px;

                            "

                        >

                            ${formatMoney(item.current)}

                            зараз /

                            ${formatMoney(item.previous)}

                            минулого місяця

                        </div>

                    </div>

                </div>

                <div

                    class="subcategory-amount"

                    style="

                        color:${

                            item.difference > 0

                                ? "var(--red)"

                                : item.difference < 0

                                    ? "var(--green)"

                                    : "var(--text-secondary)"

                        };

                    "

                >

                    ${

                        item.difference > 0

                            ? "+"

                            : ""

                    }${formatMoney(item.difference)}

                </div>

            </div>

        `).join("");

}

/* =========================================================

   BUDGET

   ========================================================= */

function openBudgetModal() {

    if ($("budget-amount")) {

        $("budget-amount").value =

            budget || "";

    }

    openModal("budget-modal");

}

function saveBudget() {

    const value = parseAmount($("budget-amount")?.value);

    if (value < 0) {

        showToast(

            "⚠️",

            "Некоректний бюджет"

        );

        return;

    }

    budget = value;

    saveData();

    closeModal("budget-modal");

    renderAll();

    showToast(

        "✓",

        "Бюджет оновлено"

    );

}

function renderBudgetPage() {

    const expenses = getMonthExpenses();

    const spent = sumAmount(expenses);

    const percent = budget > 0 ? (spent / budget) * 100 : 0;

    if ($("budget-page-total")) {

        $("budget-page-total").textContent = formatMoney(budget);

    }

    applyBudgetProgress($("budget-page-progress"), percent);

    if ($("budget-page-spent")) {

        $("budget-page-spent").textContent = formatMoney(spent);

    }

    if ($("budget-page-left")) {

        $("budget-page-left").textContent =

            budget > 0 ? formatMoney(budget - spent) : "—";

    }

    renderBudgetCategories(expenses);

}

/* =========================================================

   BUDGET CATEGORIES

   ========================================================= */

function renderBudgetCategories(expenses) {

    const container =

        $("budget-categories");

    if (!container) return;

    const totals = {};

    expenses.forEach(item => {

        totals[item.category] =

            (totals[item.category] || 0) +

            Number(item.amount || 0);

    });

    const entries =

        Object.entries(totals)

            .sort((a, b) => b[1] - a[1]);

    if (!entries.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">💰</div>

                <div class="empty-title">

                    Немає витрат

                </div>

            </div>

        `;

        return;

    }

    container.innerHTML =

        entries.map(

            ([category, amount]) => {

                const percent =

                    budget > 0

                        ? Math.min(

                            (amount / budget) * 100,

                            100

                        )

                        : 0;

                return `

                    <div class="budget-category">

                        <div class="budget-category-top">

                            <div class="budget-category-name">

                                ${

                                    categories[

                                        category

                                    ]?.icon || "💰"

                                }

                                ${escapeHTML(category)}

                            </div>

                            <div class="budget-category-values">

                                ${formatMoney(amount)}

                            </div>

                        </div>

                        <div class="progress">

                            <div

                                class="progress-bar"

                                style="width:${percent}%"

                            ></div>

                        </div>

                    </div>

                `;

            }

        ).join("");

}

/* =========================================================

   GOALS

   ========================================================= */

function openGoalModal() {

    selectedGoalId = null;

    if ($("goal-name")) {

        $("goal-name").value = "";

    }

    if ($("goal-target")) {

        $("goal-target").value = "";

    }

    openModal("goal-modal");

}

function saveGoal() {

    const name =

        $("goal-name")?.value.trim() || "";

    const target = parseAmount($("goal-target")?.value);

    if (!name) {

        showToast(

            "⚠️",

            "Введи назву цілі"

        );

        return;

    }

    if (!target || target <= 0) {

        showToast(

            "⚠️",

            "Введи суму цілі"

        );

        return;

    }

    goals.push({

        id: generateId(),

        name,

        target,

        current: 0,

        createdAt: new Date().toISOString()

    });

    saveData();

    closeModal("goal-modal");

    renderGoals();

    showToast(

        "🎯",

        "Ціль створено"

    );

}

function renderGoals() {

    const container =

        $("goals-list");

    if (!container) return;

    if (!goals.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">

                    🎯

                </div>

                <div class="empty-title">

                    Немає цілей

                </div>

                <div class="empty-description">

                    Створи ціль і відстежуй,

                    скільки вже накопичено

                </div>

            </div>

        `;

        return;

    }

    container.innerHTML =

        goals.map(goal => {

            const percent =

                goal.target > 0

                    ? Math.min(

                        (goal.current / goal.target) * 100,

                        100

                    )

                    : 0;

            return `

                <div class="goal-card">

                    <div class="goal-top">

                        <div class="goal-name">

                            🎯

                            ${escapeHTML(goal.name)}

                        </div>

                        <div class="goal-percent">

                            ${Math.round(percent)}%

                        </div>

                    </div>

                    <div class="goal-values">

                        <div class="goal-current">

                            ${formatMoney(goal.current)}

                        </div>

                        <div class="goal-target">

                            ${formatMoney(goal.target)}

                        </div>

                    </div>

                    <div class="goal-progress">

                        <div

                            class="goal-progress-fill"

                            style="width:${percent}%"

                        ></div>

                    </div>

                    <button

                        class="secondary-button"

                        style="margin-top:12px;"

                        onclick="openGoalMoneyModal('${goal.id}')"

                    >

                        + Додати гроші

                    </button>

                    <button

                        class="danger-button"

                        style="margin-top:8px;"

                        onclick="deleteGoal('${goal.id}')"

                    >

                        Видалити ціль

                    </button>

                </div>

            `;

        }).join("");

}

/* =========================================================

   GOAL MONEY

   ========================================================= */

function deleteGoal(id) {

    const index = goals.findIndex(item => item.id === id);

    if (index === -1) return;

    const [goal] = goals.splice(index, 1);

    saveData();

    renderGoals();

    showToast("🗑️", `Ціль «${goal.name}» видалено`, {

        label: "Скасувати",

        duration: 6000,

        handler: () => {

            goals.splice(Math.min(index, goals.length), 0, goal);

            saveData();

            renderGoals();

            showToast("↩️", "Ціль повернуто");

        }

    });

}

function openGoalMoneyModal(id) {

    selectedGoalId = id;

    const goal =

        goals.find(

            item => item.id === id

        );

    if (!goal) return;

    if ($("goal-money-name")) {

        $("goal-money-name").textContent =

            goal.name;

    }

    if ($("goal-money-amount")) {

        $("goal-money-amount").value = "";

    }

    openModal("goal-money-modal");

}

function addMoneyToGoal() {

    if (!selectedGoalId) return;

    const amount = parseAmount($("goal-money-amount")?.value);

    if (!amount || amount <= 0) {

        showToast(

            "⚠️",

            "Введи суму"

        );

        return;

    }

    const goal =

        goals.find(

            item =>

                item.id === selectedGoalId

        );

    if (!goal) return;

    goal.current += amount;

    if (goal.current > goal.target) {

        goal.current = goal.target;

    }

    saveData();

    closeModal("goal-money-modal");

    renderGoals();

    showToast(

        "🎯",

        "Ціль оновлено"

    );

}

/* =========================================================

   SETTINGS

   ========================================================= */

function renderSettings() {

    if ($("settings-current-name")) {

        $("settings-current-name").textContent =

            userName;

    }

    if ($("settings-name")) {

        $("settings-name").value =

            userName;

    }

    if ($("settings-avatar")) {

        $("settings-avatar").textContent =

            getInitials(userName);

    }

    if ($("header-avatar")) {

        $("header-avatar").textContent =

            getInitials(userName);

    }

}

function getInitials(name) {

    const parts =

        String(name || "К")

            .trim()

            .split(/\s+/);

    if (parts.length === 1) {

        return parts[0]

            .charAt(0)

            .toUpperCase();

    }

    return (

        parts[0].charAt(0) +

        parts[1].charAt(0)

    ).toUpperCase();

}

function saveUserName() {

    const value =

        $("settings-name")?.value.trim() || "";

    if (!value) {

        showToast(

            "⚠️",

            "Введи ім'я"

        );

        return;

    }

    userName = value;

    saveData();

    renderSettings();

    renderHome();

    showToast(

        "✓",

        "Ім'я збережено"

    );

}

/* =========================================================

   EXPORT

   ========================================================= */

async function saveFile(content, fileName, mimeType) {

    /* На телефонах (особливо iOS PWA) звичайне скачування часто не працює —

       використовуємо системне меню "Поділитися", якщо воно є. */

    try {

        const file = new File([content], fileName, { type: mimeType });

        if (

            navigator.canShare &&

            navigator.canShare({ files: [file] }) &&

            /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

        ) {

            await navigator.share({ files: [file], title: "My Mone" });

            return true;

        }

    } catch (error) {

        if (error && error.name === "AbortError") return false;

    }

    const blob = new Blob([content], { type: mimeType });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    return true;

}

async function exportData() {

    const data = {

        app: "My Mone",

        version: 3,

        exportedAt: new Date().toISOString(),

        transactions,

        budget,

        goals,

        installments,

        rules: customRules,

        userName

    };

    const saved = await saveFile(

        JSON.stringify(data, null, 2),

        `my-mone-backup-${getTodayISO()}.json`,

        "application/json"

    );

    if (saved) {

        markBackupDone();

        showToast("✓", "Резервну копію збережено");

    }

}

function csvCell(value) {

    const text = String(value ?? "");

    return /[";\r\n]/.test(text)

        ? `"${text.replace(/"/g, '""')}"`

        : text;

}

async function exportCSV() {

    const rows = [

        ["Дата", "Тип", "Сума", "Категорія", "Підкатегорія", "Опис"]

    ];

    [...transactions]

        .sort((a, b) => parseDate(b.date) - parseDate(a.date))

        .forEach(item => {

            rows.push([

                toDateInputValue(item.date),

                item.type === "income" ? "Дохід" : "Витрата",

                String(item.amount).replace(".", ","),

                item.category || "",

                item.subcategory || "",

                item.description || ""

            ]);

        });

    /* BOM + ";" — щоб Excel відкрив українською без "кракозябрів" */

    const csv =

        "\uFEFF" +

        rows.map(row => row.map(csvCell).join(";")).join("\r\n");

    const saved = await saveFile(

        csv,

        `my-mone-${getTodayISO()}.csv`,

        "text/csv"

    );

    if (saved) {

        showToast("✓", "CSV збережено");

    }

}

/* =========================================================

   BACKUP REMINDER + PERSISTENT STORAGE

   ========================================================= */

function getLastBackup() {

    return loadNumber("myMoneLastBackup");

}

function markBackupDone() {

    safeSet("myMoneLastBackup", String(Date.now()));

    renderBackupBanner();

    renderSettingsExtras();

}

function snoozeBackupBanner() {

    safeSet("myMoneBackupSnooze", String(Date.now() + 7 * 86400000));

    renderBackupBanner();

}

function renderBackupBanner() {

    const banner = $("backup-banner");

    if (!banner) return;

    const last = getLastBackup();

    const now = Date.now();

    const needed =

        transactions.length >= 5 &&

        (!last || now - last > 30 * 86400000) &&

        now > loadNumber("myMoneBackupSnooze");

    banner.style.display = needed ? "flex" : "none";

    if ($("backup-banner-text")) {

        $("backup-banner-text").textContent = last

            ? `Остання копія: ${new Date(last).toLocaleDateString("uk-UA")}. Час зробити нову.`

            : "Ще не було резервної копії. Збережи файл на випадок втрати даних.";

    }

}

function renderSettingsExtras() {

    const last = getLastBackup();

    if ($("settings-last-backup")) {

        $("settings-last-backup").textContent = last

            ? new Date(last).toLocaleDateString("uk-UA")

            : "ще не було";

    }

    const status = $("settings-storage-status");

    if (!status) return;

    if (navigator.storage && navigator.storage.persisted) {

        navigator.storage

            .persisted()

            .then(persisted => {

                status.textContent = persisted

                    ? "Захищено від автоочищення"

                    : "Браузер може очистити";

            })

            .catch(() => {

                status.textContent = "Невідомо";

            });

    } else {

        status.textContent = "Невідомо";

    }

}

async function requestPersistentStorage() {

    try {

        if (navigator.storage && navigator.storage.persist) {

            await navigator.storage.persist();

        }

    } catch (error) {

        /* не критично */

    }

}

/* =========================================================

   IMPORT

   ========================================================= */

function importData(event) {

    const input = event.target;

    const file = input.files && input.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function () {

        try {

            const data = JSON.parse(reader.result);

            if (!data || typeof data !== "object" || Array.isArray(data)) {

                throw new Error("format");

            }

            if (

                !Array.isArray(data.transactions) &&

                !Array.isArray(data.goals) &&

                !Array.isArray(data.installments)

            ) {

                throw new Error("empty");

            }

            if (!confirm("Замінити поточні дані даними з файлу?")) {

                return;

            }

            transactions = Array.isArray(data.transactions) ? data.transactions : [];

            goals = Array.isArray(data.goals) ? data.goals : [];

            installments = Array.isArray(data.installments) ? data.installments : [];

            customRules = Array.isArray(data.rules) ? data.rules : [];

            const importedBudget = Number(data.budget);

            budget = Number.isFinite(importedBudget) && importedBudget > 0

                ? importedBudget

                : 0;

            if (typeof data.userName === "string" && data.userName.trim()) {

                userName = data.userName.trim().slice(0, 40);

            }

            /* Файли старої версії містили окреме поле income */

            if (Number(data.income) > 0) {

                safeSet("myMoneIncome", String(Number(data.income)));

            }

            selectedAnalyticsCategory = null;

            migrateData();

            saveData();

            renderAll();

            showToast("✓", "Дані імпортовано");

        } catch (error) {

            showToast("❌", "Не вдалося імпортувати файл");

        }

    };

    reader.onerror = function () {

        showToast("❌", "Не вдалося прочитати файл");

    };

    reader.readAsText(file);

    input.value = "";

}

/* =========================================================

   CLEAR DATA

   ========================================================= */

function clearAllData() {

    if (!confirm("Точно видалити всі дані My Mone?")) return;

    transactions = [];

    budget = 0;

    goals = [];

    installments = [];

    selectedAnalyticsCategory = null;

    customRules = [];

    safeSet("myMoneIncome", "0");

    safeSet("myMoneLastBackup", "0");

    saveData();

    renderAll();

    showToast("✓", "Усі дані видалено");

}

/* =========================================================

   MODALS

   ========================================================= */

function openModal(id) {

    const modal = $(id);

    if (!modal) return;

    modal.classList.add("active");

    document.body.style.overflow = "hidden";

}

function closeModal(id) {

    const modal = $(id);

    if (!modal) return;

    modal.classList.remove("active");

    const anyOpen =

        document.querySelector(

            ".modal.active"

        );

    if (!anyOpen) {

        document.body.style.overflow = "";

    }

}

/* =========================================================

   MODAL BACKDROP

   ========================================================= */

document.addEventListener(

    "click",

    event => {

        const modal =

            event.target.classList.contains("modal")

                ? event.target

                : null;

        if (modal) {

            modal.classList.remove("active");

            document.body.style.overflow = "";

        }

    }

);

/* =========================================================

   TOAST

   ========================================================= */

let toastTimer = null;

function showToast(icon = "✓", message = "", action = null) {

    const toast = $("toast");

    if (!toast) return;

    if ($("toast-icon")) {

        $("toast-icon").textContent = icon;

    }

    if ($("toast-message")) {

        $("toast-message").textContent = message;

    }

    const button = $("toast-action");

    if (button) {

        if (action && action.handler) {

            button.textContent = action.label || "OK";

            button.style.display = "inline-block";

            button.onclick = () => {

                clearTimeout(toastTimer);

                toast.classList.remove("show", "has-action");

                action.handler();

            };

            toast.classList.add("has-action");

        } else {

            button.style.display = "none";

            button.onclick = null;

            toast.classList.remove("has-action");

        }

    }

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(

        () => {

            toast.classList.remove("show", "has-action");

        },

        action ? action.duration || 6000 : 2500

    );

}

/* =========================================================

   RENDER ALL

   ========================================================= */

function renderAll() {

    renderHome();

    renderTransactions();

    renderAnalytics();

    renderInstallments();

    renderBudgetPage();

    renderGoals();

    renderSettings();

}

/* =========================================================

   KEYBOARD

   ========================================================= */

document.addEventListener(

    "keydown",

    event => {

        if (event.key !== "Escape") {

            return;

        }

        document

            .querySelectorAll(".modal.active")

            .forEach(modal => {

                modal.classList.remove("active");

            });

        document.body.style.overflow = "";

    }

);

/* =========================================================

   INPUT EVENTS

   ========================================================= */

document.addEventListener("input", event => {

    if (event.target.id === "expense-amount") {

        updateInstallmentPreview();

    }

});

/* =========================================================

   ESCAPE ATTRIBUTE

   ========================================================= */

function escapeAttribute(value) {

    return String(value || "")

        .replace(/\\/g, "\\\\")

        .replace(/'/g, "\\'");

}

/* =========================================================

   SERVICE WORKER

   ========================================================= */

function registerServiceWorker() {

    if (!("serviceWorker" in navigator)) return;

    /* Service Worker працює лише на https та localhost */

    const secure =

        location.protocol === "https:" ||

        location.hostname === "localhost" ||

        location.hostname === "127.0.0.1";

    if (!secure) return;

    const hadController = !!navigator.serviceWorker.controller;

    /* Нова версія встановилась у фоні — пропонуємо перезапуск */

    navigator.serviceWorker.addEventListener("controllerchange", () => {

        if (!hadController) return;

        showToast("🔄", "Доступна нова версія", {

            label: "Оновити",

            duration: 15000,

            handler: () => location.reload()

        });

    });

    const register = () => {

        navigator.serviceWorker

            .register("./sw.js")

            .then(registration => registration.update())

            .catch(error => {

                console.warn("Service Worker не підключено:", error);

            });

    };

    if (document.readyState === "complete") {

        register();

    } else {

        window.addEventListener("load", register);

    }

}

/* =========================================================

   INITIALIZATION

   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    migrateData();

    fillCategorySelects();

    renderAll();

    showPage("home");

    registerServiceWorker();

    requestPersistentStorage();

});

/* =========================================================

   INTEGRATED MOTION ENGINE - all interaction code in app.js

   ========================================================= */

/* ============================================================

   MY MONE · MOTION ENGINE

   Presentation-only enhancements. Does not touch financial data,

   localStorage, category detection or installment calculations.

   ============================================================ */

(function () {

    "use strict";

    const prefersReducedMotion = () =>

        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const $ = id => document.getElementById(id);

    const timers = new WeakMap();

    const amountTargets = new Map();

    const activeCounters = new Map();

    let renderDepth = 0;

    function updateNavIndicator() {

        const nav = document.querySelector(".bottom-nav");

        if (!nav) return;

        const active = nav.querySelector(".nav-item.active");

        nav.classList.toggle("mm-no-selection", !active);

        nav.querySelectorAll(".nav-item").forEach(item => {

            if (item === active) item.setAttribute("aria-current", "page");

            else item.removeAttribute("aria-current");

        });

        if (!active) return;

        const bounds = nav.getBoundingClientRect();

        const button = active.getBoundingClientRect();

        if (!bounds.width || !button.width) return;

        nav.style.setProperty("--mm-indicator-left", (button.left - bounds.left) + "px");

        nav.style.setProperty("--mm-indicator-width", button.width + "px");

    }

    // Animated page transitions keep the outgoing screen visible briefly.

    if (typeof window.showPage === "function") {

        const originalShowPage = window.showPage;

        window.showPage = function (page) {

            const previous = document.querySelector(".page.active");

            const next = $("page-" + page);

            if (!next) return;

            document.querySelectorAll(".page.page-leaving").forEach(el => {

                clearTimeout(timers.get(el));

                el.classList.remove("page-leaving");

            });

            const changing = previous && previous !== next;

            const result = originalShowPage.apply(this, arguments);

            if (changing && !prefersReducedMotion()) {

                previous.classList.add("page-leaving");

                const timer = setTimeout(() => previous.classList.remove("page-leaving"), 255);

                timers.set(previous, timer);

            }

            requestAnimationFrame(updateNavIndicator);

            return result;

        };

    }

    // Closing a bottom sheet animates out (the existing close function still

    // manages scroll lock and correct modal state).

    if (typeof window.closeModal === "function") {

        const originalClose = window.closeModal;

        window.closeModal = function (id) {

            const modal = $(id);

            if (!modal || !modal.classList.contains("active") || prefersReducedMotion()) {

                return originalClose.apply(this, arguments);

            }

            clearTimeout(timers.get(modal));

            modal.classList.add("mm-closing");

            const result = originalClose.apply(this, arguments);

            const timer = setTimeout(() => modal.classList.remove("mm-closing"), 265);

            timers.set(modal, timer);

            return result;

        };

    }

    if (typeof window.openModal === "function") {

        const originalOpen = window.openModal;

        window.openModal = function (id) {

            const modal = $(id);

            if (modal) {

                clearTimeout(timers.get(modal));

                modal.classList.remove("mm-closing");

            }

            return originalOpen.apply(this, arguments);

        };

    }

    // Ensure Escape also uses the animated closing sequence.

    document.addEventListener("keydown", event => {

        if (event.key !== "Escape") return;

        const active = Array.from(document.querySelectorAll(".modal.active"));

        if (!active.length) return;

        event.preventDefault();

        event.stopImmediatePropagation();

        active.forEach(modal => window.closeModal?.(modal.id));

    }, true);

    // Stagger newly-rendered rows, cards, insights, rankings and bank buttons.

    const collectionIds = [

        "home-transactions", "transactions-list", "analytics-insights",

        "analytics-categories", "analytics-category-details",

        "analytics-subcategories", "analytics-saving-potential",

        "comparison-categories", "installment-banks", "installments-list",

        "budget-categories", "goals-list"

    ];

    function animateCollection(container) {

        if (!container || prefersReducedMotion()) return;

        const items = Array.from(container.children).slice(0, 25);

        items.forEach((item, index) => {

            item.classList.remove("mm-list-item");

            item.style.setProperty("--mm-delay", Math.min(index, 10) * 42 + "ms");

            // Force restart only for newly-created nodes; no opacity is hidden by default.

            void item.offsetWidth;

            item.classList.add("mm-list-item");

        });

    }

    // The animation engine only observes child additions: no storage mutation

    // and no infinite loop when modifying element styles or classes.

    function installCollectionObservers() {

        collectionIds.forEach(id => {

            const container = $(id);

            if (!container) return;

            const observer = new MutationObserver(records => {

                if (records.some(record => record.addedNodes.length)) {

                    animateCollection(container);

                }

            });

            observer.observe(container, { childList: true });

        });

    }

    function parseCurrency(text) {

        const clean = String(text || "").trim().replace(/[\u00a0\u202f\s]/g, "");

        const match = clean.match(/^(-?[\d.,]+)₴$/);

        if (!match) return null;

        const value = Number(match[1].replace(/,/g, "."));

        return Number.isFinite(value) ? value : null;

    }

    const amountIds = [

        "balance-value", "home-income", "home-expenses", "home-budget",

        "operations-total", "analytics-total", "analytics-average", "analytics-biggest",

        "comparison-difference", "comparison-current-total", "comparison-previous-total",

        "budget-page-total", "budget-page-spent", "budget-page-left"

    ];

    const currencyFormat = new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 2 });

    function formatCurrency(value) { return currencyFormat.format(value) + " ₴"; }

    function updateCounters() {

        amountIds.forEach(id => {

            const el = $(id);

            if (!el) return;

            const target = parseCurrency(el.textContent);

            if (target === null) return;

            const previous = amountTargets.has(id) ? amountTargets.get(id) : 0;

            const existing = activeCounters.get(id);

            if (previous === target) {

                // A new render may have written the definitive amount while

                // an older ticker is still running. Never let an old frame

                // overwrite a freshly rendered financial value.

                if (existing) {

                    cancelAnimationFrame(existing);

                    activeCounters.delete(id);

                    el.textContent = formatCurrency(target);

                }

                return;

            }

            amountTargets.set(id, target);

            if (existing) cancelAnimationFrame(existing);

            if (prefersReducedMotion() || document.hidden) {

                el.textContent = formatCurrency(target);

                return;

            }

            const duration = 640;

            const started = performance.now();

            const delta = target - previous;

            const tick = now => {

                const fraction = Math.min((now - started) / duration, 1);

                const eased = 1 - Math.pow(1 - fraction, 4);

                el.textContent = formatCurrency(previous + delta * eased);

                if (fraction < 1) activeCounters.set(id, requestAnimationFrame(tick));

                else {

                    el.textContent = formatCurrency(target);

                    activeCounters.delete(id);

                }

            };

            activeCounters.set(id, requestAnimationFrame(tick));

        });

    }

    function finishCounters() {

        // Cancel a previous run *before* another renderer rewrites DOM text.

        // This prevents intermediate counter frames from ever being treated as

        // real financial amounts on a re-render or tab switch.

        for (const [id, frame] of activeCounters) {

            cancelAnimationFrame(frame);

            const el = $(id);

            if (el && amountTargets.has(id)) {

                el.textContent = formatCurrency(amountTargets.get(id));

            }

        }

        activeCounters.clear();

    }

    ["renderHome", "renderTransactions", "renderAnalytics", "renderBudgetPage", "renderComparison", "renderAll"].forEach(name => {

        if (typeof window[name] !== "function") return;

        const original = window[name];

        window[name] = function () {

            if (renderDepth === 0) finishCounters();

            renderDepth++;

            try {

                return original.apply(this, arguments);

            } finally {

                renderDepth--;

                if (renderDepth === 0) updateCounters();

            }

        };

    });

    // Month controls, analytics tabs and category selection feel responsive.

    ["changeAnalyticsMonth", "setAnalyticsMode"].forEach(name => {

        if (typeof window[name] !== "function") return;

        const original = window[name];

        window[name] = function () {

            const result = original.apply(this, arguments);

            if (!prefersReducedMotion()) {

                const title = $("analytics-month-title");

                title?.animate?.([

                    { opacity: .3, transform: "translateY(5px)" },

                    { opacity: 1, transform: "translateY(0)" }

                ], { duration: 290, easing: "cubic-bezier(.22,1,.36,1)" });

            }

            return result;

        };

    });

    if (typeof window.selectAnalyticsCategory === "function") {

        const original = window.selectAnalyticsCategory;

        window.selectAnalyticsCategory = function (category) {

            const result = original.apply(this, arguments);

            document.querySelectorAll("#analytics-categories .category-card").forEach(card => {

                const selected = card.querySelector(".category-name")?.textContent.trim() === category;

                card.classList.toggle("selected", selected);

                card.setAttribute("aria-pressed", String(selected));

            });

            return result;

        };

    }

    // Light tactile feedback for all controls, including dynamically created ones.

    document.addEventListener("pointerdown", event => {

        const control = event.target.closest("button, .category-card, .transaction-card, .installment-card");

        if (!control || prefersReducedMotion()) return;

        control.classList.remove("mm-pressed");

        void control.offsetWidth;

        control.classList.add("mm-pressed");

    }, { passive: true });

    document.addEventListener("animationend", event => {

        if (event.animationName === "mm-tap") event.target.classList.remove("mm-pressed");

    });

    document.addEventListener("DOMContentLoaded", () => {

        installCollectionObservers();

        requestAnimationFrame(() => {

            updateNavIndicator();

            updateCounters();

            // No long animation on load for hidden screens; freshly-rendered

            // content animates when its page opens.

            const visible = document.querySelector(".page.active");

            visible?.querySelectorAll(".transactions-list, .analytics-categories").forEach(animateCollection);

        });

        window.addEventListener("resize", updateNavIndicator, { passive: true });

        window.addEventListener("orientationchange", updateNavIndicator, { passive: true });

    });

})();

