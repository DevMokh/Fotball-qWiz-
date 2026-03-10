// --- Audio Context for Sounds ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);

    if (type === 'correct') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
    } else if (type === 'wrong') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
    } else if (type === 'click') {
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
    }

    oscillator.start(audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.2);
    oscillator.stop(audioCtx.currentTime + 0.2);
}


// --- Database (50 Players) ---
const db = [    { name: "ليونيل ميسي", infos: ["فزت بالكرة الذهبية 8 مرات.", "قُدت الأرجنتين للفوز بكأس العالم 2022.", "أنا الهداف التاريخي لنادي برشلونة."], decoys: ["كريستيانو رونالدو", "نيمار جونيور"], mainClub: "برشلونة", nationality: "🇦🇷" },
    { name: "كريستيانو رونالدو", infos: ["أنا الهداف التاريخي لكرة القدم.", "فزت بدوري الأبطال 5 مرات.", "فزت ببطولة أمم أوروبا 2016."], decoys: ["ليونيل ميسي", "لويس فيغو"], mainClub: "ريال مدريد", nationality: "🇵🇹" },
    { name: "محمد صلاح", infos: ["فزت بالحذاء الذهبي للدوري الإنجليزي 3 مرات.", "فزت بدوري الأبطال مع ليفربول 2019.", "بدأت مسيرتي الأوروبية في بازل."], decoys: ["رياض محرز", "حكيم زياش"], mainClub: "ليفربول", nationality: "🇪🇬" },
    { name: "زين الدين زيدان", infos: ["فزت بكأس العالم 1998.", "فزت بدوري الأبطال كلاعب ومدرب مع ريال مدريد.", "اشتهرت بحركة 'المروحة'."], decoys: ["ميشيل بلاتيني", "تييري هنري"], mainClub: "ريال مدريد", nationality: "🇫🇷" },
    { name: "رونالدينيو", infos: ["فزت بكأس العالم 2002 والكرة الذهبية 2005.", "اشتهرت بأسلوبي المبهج والساحر.", "تلقيت تصفيقًا من جماهير ريال مدريد."], decoys: ["كاكا", "ريفالدو"], mainClub: "برشلونة", nationality: "🇧🇷" },
    { name: "بيليه", infos: ["يعتبرني الكثيرون أعظم لاعب في التاريخ.", "فزت بكأس العالم 3 مرات مع البرازيل.", "سجلت أكثر من 1000 هدف في مسيرتي."], decoys: ["مارادونا", "غارينشا"], mainClub: "سانتوس", nationality: "🇧🇷" },
    { name: "دييغو مارادونا", infos: ["قُدت الأرجنتين للفوز بكأس العالم 1986.", "سجلت هدفًا باليد عُرف بـ 'يد الرب'.", "لعبت لنابولي وحققت معهم إنجازات تاريخية."], decoys: ["بيليه", "ميسي"], mainClub: "نابولي", nationality: "🇦🇷" },
    { name: "يوهان كرويف", infos: ["أنا أب روحي لمفهوم 'الكرة الشاملة'.", "فزت بالكرة الذهبية 3 مرات.", "لعبت لأياكس وبرشلونة كلاعب ومدرب."], decoys: ["فرانز بيكنباور", "ماركو فان باستن"], mainClub: "أياكس", nationality: "🇳🇱" },
    { name: "الظاهرة رونالدو", infos: ["فزت بكأس العالم 2002 وكنت هداف البطولة.", "لعبت للغريمين برشلونة وريال مدريد، وكذلك ميلان وإنتر.", "عانيت من إصابات خطيرة في الركبة."], decoys: ["رونالدينيو", "روماريو"], mainClub: "إنتر ميلان", nationality: "🇧🇷" },
    { name: "كيليان مبابي", infos: ["فزت بكأس العالم 2018 وأنا مراهق.", "أُعرف بسرعتي الفائقة.", "أنا الهداف التاريخي لنادي باريس سان جيرمان."], decoys: ["إيرلينغ هالاند", "عثمان ديمبيلي"], mainClub: "باريس سان جيرمان", nationality: "🇫🇷" },
    { name: "نيمار جونيور", infos: ["انتقلت إلى باريس سان جيرمان في أغلى صفقة بالتاريخ.", "فزت بدوري الأبطال مع برشلونة عام 2015.", "أُعرف بمهاراتي العالية في المراوغة."], decoys: ["كوتينيو", "فينيسيوس جونيور"], mainClub: "برشلونة", nationality: "🇧🇷" },
    { name: "لوكا مودريتش", infos: ["فزت بالكرة الذهبية عام 2018، كاسرًا هيمنة ميسي ورونالدو.", "قُدت كرواتيا لنهائي كأس العالم 2018.", "أتميز بتمريراتي الخارجية الدقيقة (بالوجه الخارجي للقدم)."], decoys: ["توني كروس", "إيفان راكيتيتش"], mainClub: "ريال مدريد", nationality: "🇭🇷" },
    { name: "كيفين دي بروين", infos: ["أُعتبر أحد أفضل صانعي اللعب في العالم.", "ألعب في الدوري الإنجليزي مع مانشستر سيتي.", "أتميز بقدرتي على التمرير بكلتا القدمين."], decoys: ["برونو فرنانديز", "مارتن أوديغارد"], mainClub: "مانشستر سيتي", nationality: "🇧🇪" },
    { name: "رياض محرز", infos: ["قُدت ليستر سيتي لتحقيق معجزة الفوز بالدوري الإنجليزي.", "فزت بكأس الأمم الأفريقية مع الجزائر عام 2019.", "أتميز بقدمي اليسرى القوية والمهارية."], decoys: ["محمد صلاح", "ساديو ماني"], mainClub: "مانشستر سيتي", nationality: "🇩🇿" },
    { name: "زلاتان إبراهيموفيتش", infos: ["لعبت لأياكس، يوفنتوس، إنتر، برشلونة، ميلان، ومانشستر يونايتد.", "أُعرف بشخصيتي القوية وتصريحاتي المثيرة للجدل.", "سجلت أهدافًا أكروباتية مذهلة."], decoys: ["ديدييه دروغبا", "واين روني"], mainClub: "ميلان", nationality: "🇸🇪" },
    { name: "أندريس إنييستا", infos: ["سجلت هدف الفوز لإسبانيا في نهائي كأس العالم 2010.", "شكلت ثلاثيًا أسطوريًا في وسط برشلونة مع تشافي وبوسكيتس.", "أنهيت مسيرتي الأوروبية ولعبت في اليابان."], decoys: ["تشافي هيرنانديز", "سيسك فابريغاس"], mainClub: "برشلونة", nationality: "🇪🇸" },
    { name: "تشافي هيرنانديز", infos: ["أنا مهندس خط وسط برشلونة وإسبانيا في العصر الذهبي.", "أُعرف بقدرتي على التحكم في إيقاع اللعب وتمريراتي الدقيقة.", "أصبحت مدربًا لنادي برشلونة بعد اعتزالي."], decoys: ["أندريس إنييستا", "تشابي ألونسو"], mainClub: "برشلونة", nationality: "🇪🇸" },
    { name: "باولو مالديني", infos: ["قضيت مسيرتي بأكملها في نادي ميلان.", "لعبت كظهير أيسر وقلب دفاع وفزت بدوري الأبطال 5 مرات.", "اعتزل النادي قميصي رقم 3 تكريمًا لي."], decoys: ["فرانكو باريزي", "أليساندرو نيستا"], mainClub: "ميلان", nationality: "🇮🇹" },
    { name: "تييري هنري", infos: ["أنا الهداف التاريخي لنادي أرسنال.", "كنت جزءًا من 'الفريق الذي لا يقهر' في أرسنال.", "أُعرف بسرعتي وأهدافي الأنيقة بقدمي اليمنى."], decoys: ["دينيس بيركامب", "رود فان نيستلروي"], mainClub: "أرسنال", nationality: "🇫🇷" },
    { name: "كاكا", infos: ["فزت بالكرة الذهبية عام 2007 كآخر لاعب قبل هيمنة ميسي ورونالدو.", "كنت معروفًا بانطلاقاتي السريعة بالكرة من وسط الملعب.", "فزت بدوري الأبطال مع ميلان."], decoys: ["رونالدينيو", "أندريا بيرلو"], mainClub: "ميلان", nationality: "🇧🇷" },
    { name: "إيرلينغ هالاند", infos: ["أُعرف بقوتي البدنية الهائلة وقدرتي التهديفية.", "حطمت الرقم القياسي لعدد الأهداف في موسم واحد بالدوري الإنجليزي.", "ألعب حاليًا في مانشستر سيتي."], decoys: ["كيليان مبابي", "روبرت ليفاندوفسكي"], mainClub: "مانشستر سيتي", nationality: "🇳🇴" },
    { name: "ساديو ماني", infos: ["شكلت ثلاثيًا هجوميًا مرعبًا في ليفربول مع صلاح وفيرمينو.", "فزت بكأس الأمم الأفريقية مع السنغال.", "انتقلت للعب في الدوري الألماني ثم السعودي."], decoys: ["رياض محرز", "بيير إيميريك أوباميانغ"], mainClub: "ليفربول", nationality: "🇸🇳" },
    { name: "أندريا بيرلو", infos: ["كنت معروفًا بلقب 'المهندس' بسبب تمريراتي الدقيقة ورؤيتي للملعب.", "فزت بكأس العالم 2006 مع إيطاليا.", "كنت متخصصًا في تنفيذ الركلات الحرة."], decoys: ["جينارو غاتوزو", "دانييلي دي روسي"], mainClub: "يوفنتوس", nationality: "🇮🇹" },
    { name: "سيرجيو راموس", infos: ["أنا مدافع ولكنني سجلت العديد من الأهداف الحاسمة بالرأس.", "فزت بدوري الأبطال 4 مرات مع ريال مدريد.", "أحمل الرقم القياسي في عدد البطاقات الحمراء في الليغا."], decoys: ["جيرارد بيكيه", "بيبي"], mainClub: "ريال مدريد", nationality: "🇪🇸" },
    { name: "مانويل نوير", infos: ["أُعرف بأسلوب 'الحارس الليبرو' وخروجي من المرمى.", "فزت بكأس العالم 2014 مع ألمانيا.", "قضيت معظم مسيرتي مع بايرن ميونخ."], decoys: ["أوليفر كان", "جانلويجي بوفون"], mainClub: "بايرن ميونخ", nationality: "🇩🇪" },
    { name: "فرانز بيكنباور", infos: ["اخترعت مركز 'الليبرو' أو 'القشاش'.", "فزت بكأس العالم كلاعب عام 1974 وكمدرب عام 1990.", "أنا أحد أساطير نادي بايرن ميونخ."], decoys: ["يوهان كرويف", "غيرد مولر"], mainClub: "بايرن ميونخ", nationality: "🇩🇪" },
    { name: "ميشيل بلاتيني", infos: ["فزت بالكرة الذهبية 3 سنوات متتالية.", "قُدت فرنسا للفوز ببطولة أمم أوروبا 1984.", "أصبحت رئيسًا للاتحاد الأوروبي لكرة القدم (UEFA)."], decoys: ["زين الدين زيدان", "جان بيير بابان"], mainClub: "يوفنتوس", nationality: "🇫🇷" },
    { name: "ماركو فان باستن", infos: ["اعتزلت كرة القدم مبكرًا في سن 28 بسبب الإصابة.", "سجلت هدفًا أسطوريًا من زاوية مستحيلة في نهائي يورو 1988.", "فزت بالكرة الذهبية 3 مرات."], decoys: ["رود خوليت", "فرانك ريكارد"], mainClub: "ميلان", nationality: "🇳🇱" },
    { name: "جورج ويا", infos: ["أنا اللاعب الأفريقي الوحيد الذي فاز بالكرة الذهبية.", "أصبحت رئيسًا لبلدي ليبيريا بعد اعتزالي.", "لعبت لأندية موناكو وباريس سان جيرمان وميلان."], decoys: ["صامويل إيتو", "ديدييه دروغبا"], mainClub: "ميلان", nationality: "🇱🇷" },
    { name: "روبرتو باجيو", infos: ["كنت معروفًا بـ 'ذيل الحصان الإلهي' بسبب قصة شعري.", "أهدرت ركلة الترجيح الحاسمة لإيطاليا في نهائي كأس العالم 1994.", "فزت بالكرة الذهبية عام 1993."], decoys: ["أليساندرو ديل بييرو", "فرانشيسكو توتي"], mainClub: "يوفنتوس", nationality: "🇮🇹" },
    { name: "دينيس بيركامب", infos: ["كنت أعاني من فوبيا الطيران، مما حد من مشاركاتي الأوروبية.", "سجلت هدفًا أسطوريًا ضد نيوكاسل بعد دوران مذهل.", "أنا أحد أساطير نادي أرسنال."], decoys: ["تييري هنري", "باتريك فييرا"], mainClub: "أرسنال", nationality: "🇳🇱" },
    { name: "أوليفر كان", infos: ["كنت حارس مرمى معروف بشخصيتي القوية وتصدياتي المذهلة.", "فزت بجائزة أفضل لاعب في كأس العالم 2002، وهو إنجاز نادر لحارس مرمى.", "قضيت معظم مسيرتي مع بايرن ميونخ."], decoys: ["مانويل نوير", "ينس ليمان"], mainClub: "بايرن ميونخ", nationality: "🇩🇪" },
    { name: "غابرييل باتيستوتا", infos: ["أُعرف بلقب 'باتيغول' بسبب قوتي التهديفية.", "أنا أحد أساطير نادي فيورنتينا.", "كنت أسدد الكرة بقوة هائلة."], decoys: ["هرنان كريسبو", "أبيل بالبو"], mainClub: "فيورنتينا", nationality: "🇦🇷" },
    { name: "فرانشيسكو توتي", infos: ["قضيت مسيرتي بأكملها في نادي روما وأُعرف بلقب 'الملك'.", "فزت بكأس العالم 2006 مع إيطاليا.", "كنت معروفًا بوفائي الشديد لناديي."], decoys: ["أليساندرو ديل بييرو", "دانييلي دي روسي"], mainClub: "روما", nationality: "🇮🇹" },
    { name: "ستيفن جيرارد", infos: ["أنا أسطورة نادي ليفربول وقائده التاريخي.", "قُدت ليفربول لعودة تاريخية في نهائي دوري أبطال 2005.", "تعرضت لـ 'زلقة' شهيرة كلفت فريقي لقب الدوري."], decoys: ["فرانك لامبارد", "بول سكولز"], mainClub: "ليفربول", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "ديدييه دروغبا", infos: ["أنا أسطورة نادي تشيلسي ومعروف بقوتي في الكرات الهوائية.", "سجلت هدف التعادل وركلة الترجيح الحاسمة في نهائي دوري أبطال 2012.", "فزت بجائزة أفضل لاعب أفريقي مرتين."], decoys: ["صامويل إيتو", "إيمانويل أديبايور"], mainClub: "تشيلسي", nationality: "🇨🇮" },
    { name: "واين روني", infos: ["أنا الهداف التاريخي لنادي مانشستر يونايتد ومنتخب إنجلترا.", "فزت بدوري الأبطال والدوري الإنجليزي عدة مرات.", "سجلت هدفًا أسطوريًا بمقصية ضد مانشستر سيتي."], decoys: ["مايكل أوين", "آلان شيرر"], mainClub: "مانشستر يونايتد", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "فيرجيل فان دايك", infos: ["أُعتبر أحد أفضل المدافعين في العالم في السنوات الأخيرة.", "فزت بدوري الأبطال مع ليفربول وكنت قريبًا من الفوز بالكرة الذهبية.", "أتميز بقوتي البدنية وهدوئي في الملعب."], decoys: ["روبن دياز", "سيرجيو راموس"], mainClub: "ليفربول", nationality: "🇳🇱" },
    { name: "روبرت ليفاندوفسكي", infos: ["فزت بجائزة أفضل لاعب في العالم من الفيفا مرتين.", "سجلت 5 أهداف في 9 دقائق في مباراة بالدوري الألماني.", "أنا أحد أعظم الهدافين في تاريخ بايرن ميونخ وبوروسيا دورتموند."], decoys: ["إيرلينغ هالاند", "كريم بنزيما"], mainClub: "بايرن ميونخ", nationality: "🇵🇱" },
    { name: "أنطوان غريزمان", infos: ["فزت بكأس العالم 2018 مع فرنسا.", "كنت هداف وأفضل لاعب في يورو 2016.", "عدت إلى أتلتيكو مدريد بعد فترة غير ناجحة في برشلونة."], decoys: ["أوليفييه جيرو", "فرانك ريبري"], mainClub: "أتلتيكو مدريد", nationality: "🇫🇷" },
    { name: "هاري كين", infos: ["أنا الهداف التاريخي لمنتخب إنجلترا ونادي توتنهام.", "فزت بالحذاء الذهبي في كأس العالم 2018.", "انتقلت إلى بايرن ميونخ بحثًا عن الألقاب."], decoys: ["جيمي فاردي", "رحيم ستيرلينغ"], mainClub: "توتنهام", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "سون هيونغ مين", infos: ["فزت بجائزة بوشكاش لأفضل هدف بعد مجهود فردي رائع.", "تقاسمت جائزة الحذاء الذهبي في الدوري الإنجليزي.", "أنا قائد منتخب كوريا الجنوبية وأسطورة نادي توتنهام."], decoys: ["بارك جي سونغ", "تاكيفوسا كوبو"], mainClub: "توتنهام", nationality: "🇰🇷" },
    { name: "أشرف حكيمي", infos: ["ألعب في مركز الظهير الأيمن وأتميز بسرعتي وقدراتي الهجومية.", "لعبت لأندية ريال مدريد، بوروسيا دورتموند، إنتر ميلان، وباريس سان جيرمان.", "قُدت المغرب لإنجاز تاريخي بالوصول لنصف نهائي كأس العالم 2022."], decoys: ["نصير مزراوي", "جواو كانسيلو"], mainClub: "باريس سان جيرمان", nationality: "🇲🇦" },
    { name: "ألفونسو ديفيز", infos: ["أُعرف بأنني أحد أسرع اللاعبين في العالم.", "ألعب كظهير أيسر في نادي بايرن ميونخ.", "ولدت في مخيم للاجئين في غانا قبل الانتقال إلى كندا."], decoys: ["أندي روبرتسون", "ثيو هيرنانديز"], mainClub: "بايرن ميونخ", nationality: "🇨🇦" },
    { name: "فيل فودين", infos: ["تدرجت في أكاديمية مانشستر سيتي وأُعرف بلقب 'فتى ستوكبورت'.", "فزت بالعديد من ألقاب الدوري الإنجليزي ودوري الأبطال.", "أتميز بمهاراتي العالية في المساحات الضيقة."], decoys: ["جاك غريليش", "ماسون ماونت"], mainClub: "مانشستر سيتي", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "جود بيلينغهام", infos: ["انتقلت إلى ريال مدريد في صفقة ضخمة وأصبحت نجم الفريق الأول.", "ألعب في خط الوسط ولكنني أسجل الكثير من الأهداف.", "ارتديت القميص رقم 5 تكريمًا لزيدان."], decoys: ["بيدري", "جمال موسيالا"], mainClub: "ريال مدريد", nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { name: "جمال موسيالا", infos: ["أتميز بقدرتي الاستثنائية على المراوغة في المساحات الضيقة.", "مثلت منتخبات إنجلترا للشباب قبل أن أختار اللعب لمنتخب ألمانيا الأول.", "ألعب في نادي بايرن ميونخ."], decoys: ["فلوريان فيرتز", "كاي هافيرتز"], mainClub: "بايرن ميونخ", nationality: "🇩🇪" },
    { name: "فيكتور أوسيمين", infos: ["قُدت نابولي للفوز بلقب الدوري الإيطالي لأول مرة منذ عصر مارادونا.", "أرتدي قناعًا واقيًا للوجه بعد تعرضي لإصابة خطيرة.", "فزت بجائزة أفضل لاعب في أفريقيا."], decoys: ["دوشان فلاهوفيتش", "لاوتارو مارتينيز"], mainClub: "نابولي", nationality: "🇳🇬" },
    { name: "خفيتشا كفاراتسخيليا", infos: ["أُعرف بلقب 'كفارادونا' بسبب أسلوب لعبي الذي يذكر بمارادونا.", "شكلت ثنائيًا رائعًا مع أوسيمين في نابولي.", "أنا من دولة جورجيا."], decoys: ["رفائيل لياو", "فيديريكو كييزا"], mainClub: "نابولي", nationality: "🇬🇪" },
    { name: "روميلو لوكاكو", infos: ["أنا الهداف التاريخي لمنتخب بلجيكا.", "أتميز بقوتي البدنية الهائلة.", "لعبت لأندية تشيلسي، مانشستر يونايتد، وإنتر ميلان."], decoys: ["ألفارو موراتا", "إدين دجيكو"], mainClub: "إنتر ميلان", nationality: "🇧🇪" },
    { name: "برونو فرنانديز", infos: ["أصبحت قائد نادي مانشستر يونايتد.", "أتميز بقدرتي على صناعة الأهداف وتسجيلها من خط الوسط.", "انضممت إلى مانشستر يونايتد قادمًا من سبورتينغ لشبونة."], decoys: ["كيفين دي بروين", "كريستيان إريكسن"], mainClub: "مانشستر يونايتد", nationality: "🇵🇹" },
    { name: "باولو ديبالا", infos: ["أُعرف بلقب 'الجوهرة' (La Joya).", "احتفل بأهدافي بوضع قناع على وجهي.", "لعبت ليوفنتوس قبل الانتقال إلى روما."], decoys: ["لاوتارو مارتينيز", "أنخيل دي ماريا"], mainClub: "يوفنتوس", nationality: "🇦🇷" },
    { name: "توني كروس", infos: ["فزت بكأس العالم 2014 مع ألمانيا.", "أتميز بدقة تمريراتي التي تتجاوز 90% في معظم المباريات.", "أعلنت اعتزالي بعد يورو 2024."], decoys: ["لوكا مودريتش", "إيلكاي غوندوغان"], mainClub: "ريال مدريد", nationality: "🇩🇪" },
    { name: "جانلويجي بوفون", infos: ["أنا أحد أعظم حراس المرمى في التاريخ ومسيرتي امتدت لسنوات طويلة جدًا.", "فزت بكأس العالم 2006 مع إيطاليا.", "قضيت معظم مسيرتي الأسطورية مع يوفنتوس."], decoys: ["إيكر كاسياس", "بيتر تشيك"], mainClub: "يوفنتوس", nationality: "🇮🇹" },
    { name: "إيكر كاسياس", infos: ["كنت قائد منتخب إسبانيا وريال مدريد لسنوات طويلة.", "فزت بكأس العالم وبطولتي يورو متتاليتين مع إسبانيا.", "أُعرف بلقب 'القديس' بسبب تصدياتي الإعجازية."], decoys: ["جانلويجي بوفون", "فيكتور فالديز"], mainClub: "ريال مدريد", nationality: "🇪🇸" }
];
// --- Config ---
const levels = [ { name: "مبتدئ", minScore: 0 }, { name: "هاوٍ", minScore: 500 }, { name: "محترف", minScore: 1500 }, { name: "خبير", minScore: 4000 }, { name: "أسطورة", minScore: 10000 } ];
const POWERUP_COSTS = { '5050': 15, 'nation': 20, 'club': 25, 'hint': 30 };
const INITIAL_COINS = 100;
const QUESTION_TIME = 20;
const CHALLENGE_MODE_DURATION = 60;

// --- Game State ---
let gameMode = 'normal';
let currentQuestion = {}, currentInfoIndex = 0, score = 0, potentialPoints = 30, streak = 0, coins = 0;
let normalHighScore = 0, challengeHighScore = 0;
let bestStreak = 0;
let powerupsUsedCount = 0;
let usedPlayerIndices = [];
let questionTimer, mainTimer;

// --- DOM Elements ---
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const endScreen = document.getElementById('end-screen');
const startNormalBtn = document.getElementById('start-normal-btn');
const startChallengeBtn = document.getElementById('start-challenge-btn');
const gameModeDisplay = document.getElementById('game-mode-display');
const mainTimerDisplay = document.getElementById('main-timer-display');
const scoreEl = document.getElementById('score');
const coinsDisplay = document.getElementById('coins-display');
const potentialPointsEl = document.getElementById('potential-points');
const infoBoxEl = document.getElementById('info-box');
const nextInfoBtn = document.getElementById('next-info-btn');
const choicesEl = document.getElementById('choices');
const resultOverlayEl = document.getElementById('result-overlay');
const resultTextEl = document.getElementById('result-text');
const finalScoreEl = document.getElementById('final-score');
const finalScoreLabel = document.getElementById('final-score-label');
const restartBtn = document.getElementById('restart-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const highScoreDisplay = document.getElementById('high-score-display');
const challengeHighScoreDisplay = document.getElementById('challenge-high-score-display');
const highScoreEndDisplay = document.getElementById('high-score-end-display');
const challengeHighScoreEndDisplay = document.getElementById('challenge-high-score-end-display');
const bestStreakDisplay = document.getElementById('best-streak-display');
const powerupsUsedDisplay = document.getElementById('powerups-used-display');
const playerLevelEl = document.getElementById('player-level');
const progressBarEl = document.getElementById('progress-bar');
const timerBar = document.getElementById('timer-bar');
const powerups = {
    '5050': document.getElementById('powerup-5050'), 'nation': document.getElementById('powerup-nation'),
    'club': document.getElementById('powerup-club'), 'hint': document.getElementById('powerup-hint')
};

// --- Game Logic ---
function initGame() {
    normalHighScore = localStorage.getItem('knowThePlayerNormalHighScore') || 0;
    challengeHighScore = localStorage.getItem('knowThePlayerChallengeHighScore') || 0;
    highScoreDisplay.textContent = normalHighScore;
    challengeHighScoreDisplay.textContent = challengeHighScore;
    
    startScreen.classList.remove('hidden');
    gameContainer.classList.add('hidden');
    endScreen.classList.add('hidden');
}

function startGame(mode) {
    gameMode = mode;
    score = 0;
    streak = 0;
    coins = INITIAL_COINS;
    bestStreak = 0;
    powerupsUsedCount = 0;
    usedPlayerIndices = [];
    
    startScreen.classList.add('hidden');
    endScreen.classList.add('hidden');
    gameContainer.classList.remove('hidden');

    if (gameMode === 'challenge') {
        startMainTimer();
        gameModeDisplay.textContent = "تحدي الـ 60 ثانية";
        playerLevelEl.style.display = 'none';
        progressBarEl.parentElement.style.display = 'none';
    } else {
        mainTimerDisplay.textContent = "";
        gameModeDisplay.textContent = "الوضع العادي";
        playerLevelEl.style.display = 'block';
        progressBarEl.parentElement.style.display = 'block';
    }
    
    loadQuestion();
}

function startMainTimer() {
    clearInterval(mainTimer);
    let timeLeft = CHALLENGE_MODE_DURATION;
    mainTimerDisplay.textContent = `الوقت: ${timeLeft}`;
    mainTimer = setInterval(() => {
        timeLeft--;
        mainTimerDisplay.textContent = `الوقت: ${timeLeft}`;
        if (timeLeft <= 0) {
            clearInterval(mainTimer);
            clearInterval(questionTimer);
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(mainTimer);
    clearInterval(questionTimer);

    if (gameMode === 'normal') {
        if (score > normalHighScore) {
            normalHighScore = score;
            localStorage.setItem('knowThePlayerNormalHighScore', normalHighScore);
        }
    } else {
        if (score > challengeHighScore) {
            challengeHighScore = score;
            localStorage.setItem('knowThePlayerChallengeHighScore', challengeHighScore);
        }
    }
    
    finalScoreLabel.textContent = gameMode === 'normal' ? "نتيجتك النهائية:" : "الأسئلة الصحيحة:";
    finalScoreEl.textContent = score;
    highScoreEndDisplay.textContent = normalHighScore;
    challengeHighScoreEndDisplay.textContent = challengeHighScore;
    bestStreakDisplay.textContent = bestStreak;
    powerupsUsedDisplay.textContent = powerupsUsedCount;
    
    gameContainer.classList.add('hidden');
    endScreen.classList.remove('hidden');
}

function startQuestionTimer() {
    clearInterval(questionTimer);
    timerBar.style.transition = 'none';
    timerBar.style.width = '100%';
    
    setTimeout(() => {
        timerBar.style.transition = `width ${QUESTION_TIME}s linear`;
        timerBar.style.width = '0%';
    }, 100);

    questionTimer = setInterval(() => {
        if (gameMode === 'normal') {
            clearInterval(questionTimer);
            playSound('wrong');
            showResult(false, `انتهى الوقت! اللاعب هو: ${currentQuestion.name}`);
            setTimeout(() => { resultOverlayEl.style.display = 'none'; endGame(); }, 2500);
        } else {
            clearInterval(questionTimer);
            playSound('wrong');
            showResult(false, `انتهى الوقت!`);
            setTimeout(() => { resultOverlayEl.style.display = 'none'; loadQuestion(); }, 2000);
        }
    }, QUESTION_TIME * 1000);
}

function loadQuestion() {
    if (usedPlayerIndices.length === db.length) usedPlayerIndices = [];
    let playerIndex;
    do { playerIndex = Math.floor(Math.random() * db.length); } while (usedPlayerIndices.includes(playerIndex));
    usedPlayerIndices.push(playerIndex);
    currentQuestion = db[playerIndex];
    
    resetQuestionUI();
    displayInfo();
    createChoices();
    startQuestionTimer();
}

function resetQuestionUI() {
    currentInfoIndex = 0;
    potentialPoints = 30;
    infoBoxEl.innerHTML = '';
    choicesEl.innerHTML = '';
    nextInfoBtn.disabled = false;
    updateUI();
}

function displayInfo(infoText) {
    const info = document.createElement('p');
    info.innerHTML = infoText || `- ${currentQuestion.infos[currentInfoIndex]}`;
    info.classList.add('fade-in'); // <-- أضف هذا السطر
    infoBoxEl.appendChild(info);

}

function createChoices() {
    const choices = [...currentQuestion.decoys, currentQuestion.name].sort(() => Math.random() - 0.5);
    choicesEl.innerHTML = '';
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice;
        button.onclick = () => checkAnswer(choice);
        choicesEl.appendChild(button);
    });
}

function checkAnswer(selectedChoice) {
    clearInterval(questionTimer);
    let isCorrect = selectedChoice === currentQuestion.name;
    
    if (isCorrect) {
        playSound('correct');
        streak++;
        if (streak > bestStreak) {
            bestStreak = streak;
        }
        let earnedCoins = Math.floor(potentialPoints / 10);
        if (gameMode === 'normal') {
            score += potentialPoints;
        } else {
            score++;
        }
        coins += earnedCoins;
        let resultMsg = `إجابة صحيحة!`;
        if (gameMode === 'normal') resultMsg += ` +${potentialPoints} نقطة`;
        resultMsg += ` | +${earnedCoins} عملة`;
        
        showResult(true, resultMsg);
        setTimeout(() => { resultOverlayEl.style.display = 'none'; loadQuestion(); }, 1500);
    } else {
        playSound('wrong');
        streak = 0;
        if (gameMode === 'normal') {
            showResult(false, `إجابة خاطئة! اللاعب هو: ${currentQuestion.name}`);
            setTimeout(() => { resultOverlayEl.style.display = 'none'; endGame(); }, 2500);
        } else {
            showResult(false, `إجابة خاطئة!`);
            setTimeout(() => { resultOverlayEl.style.display = 'none'; loadQuestion(); }, 1500);
        }
    }
}

function showResult(isCorrect, text) {
    resultTextEl.textContent = text;
    resultOverlayEl.className = isCorrect ? 'result-overlay correct' : 'result-overlay wrong';
    resultOverlayEl.style.display = 'flex';
}

function updateUI() {
    const scoreLabel = gameMode === 'normal' ? "النقاط" : "الصحيحة";
    scoreEl.textContent = `${scoreLabel}: ${score}`;
    coinsDisplay.textContent = `💰 ${coins}`;
    potentialPointsEl.textContent = `النقاط: ${potentialPoints}`;
    
    Object.entries(powerups).forEach(([key, btn]) => {
        btn.disabled = coins < POWERUP_COSTS[key];
    });
    
    if (gameMode === 'normal') {
        let currentLevel = levels.filter(l => score >= l.minScore).pop() || levels[0];
        let nextLevel = levels[levels.indexOf(currentLevel) + 1];
        playerLevelEl.textContent = currentLevel.name;
        if (nextLevel) {
            let scoreInLevel = score - currentLevel.minScore;
            let levelScoreRange = nextLevel.minScore - currentLevel.minScore;
            progressBarEl.style.width = `${(scoreInLevel / levelScoreRange) * 100}%`;
        } else {
            progressBarEl.style.width = '100%';
        }
    }
}

// --- Event Listeners ---
nextInfoBtn.addEventListener('click', () => {
    currentInfoIndex++;
    if (currentInfoIndex < currentQuestion.infos.length) {
        displayInfo();
        potentialPoints = (currentInfoIndex === 1) ? 20 : 10;
        updateUI();
        if (currentInfoIndex === 2) nextInfoBtn.disabled = true;
    }
});

Object.entries(powerups).forEach(([key, btn]) => {
    btn.addEventListener('click', () => {
        const cost = POWERUP_COSTS[key];

        if (btn.disabled) return; // لمنع الضغط على الزر المعطل

        if (coins >= cost) {
            // لديك عملات كافية
            playSound('click'); // صوت نجاح
            coins -= cost;
            powerupsUsedCount++;
            btn.disabled = true;
            switch (key) {
                // ... (case statements remain the same) ...
            }
            updateUI();
        } else {
            // ليس لديك عملات كافية
            playSound('wrong'); // <-- هذا هو التعديل الوحيد في قسم else
        }
    });
});


startNormalBtn.addEventListener('click', () => startGame('normal'));
startChallengeBtn.addEventListener('click', () => startGame('challenge'));
restartBtn.addEventListener('click', () => startGame(gameMode)); // Modified to restart the same mode
backToMenuBtn.addEventListener('click', initGame);

// Add click sound to all buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => playSound('click'));
});

// --- Initial Load ---
initGame();
