/* ============================== BARKS ======================================
   What the men say, in their own language and script: when picked, on the move, opening fire, scoring a kill,
   taking hits, taking ground, arriving fresh, and the idle talk between fights. Each line is mumbled in the
   speaker's own voice (babble) and shown in a speech bubble. Chinese is in traditional characters, as both
   the Nationalists and the Communists wrote it then. */
const BARK_LINES = {
  ger:{sel:['Jawohl!', 'Zu Befehl!', 'Verstanden!', 'Jawohl, Herr Leutnant!', 'Los, los!'], veh:['Panzer marsch!', 'Motor läuft!', 'Fahrer, vorwärts!', 'Luke zu!', 'Jawohl!'],
    move:['Vorwärts!', 'Marsch, marsch!', 'Mir nach!', 'Schneller!', 'Ausschwärmen!'], atk:['Feuer frei!', 'Feuer!', 'Ziel erkannt!', 'Gib ihm!', 'Handgranate!'],
    kill:['Volltreffer!', 'Erledigt!', 'Abschuss!', 'Der ist hin!', 'Treffer!'], hurt:['Sanitäter!', 'Deckung!', 'Rückzug!', 'Ich bin getroffen!', 'Verdammt!'],
    cap:['Gesichert!', 'Stellung genommen!', 'Das gehört jetzt uns!'], new:['Zur Stelle!', 'Melde mich zum Dienst!', 'Bereit!'],
    idle:['Hat einer Feuer?', 'Wo bleibt die Gulaschkanone?', 'Wann geht\'s nach Hause?', 'Zu ruhig hier…', 'Schreib mal wieder, Mutti…', 'Kalt heute.']},
  us:{sel:['Yes sir!', 'On our way!', 'Roger!', 'You got it!', 'Wilco!'], veh:['Rolling!', 'Buttoning up!', 'Roger that!', 'Step on it!', 'Let\'s roll!'],
    move:['Let\'s go, let\'s go!', 'Keep moving!', 'Spread out!', 'Follow me!', 'Double time!'], atk:['Fire!', 'Give \'em hell!', 'On the way!', 'Light \'em up!', 'Fire in the hole!'],
    kill:['Got him!', 'Scratch one!', 'He\'s done!', 'Target down!', 'That\'s a kill!'], hurt:['Medic!', 'We\'re hit!', 'Get down!', 'I\'m hit!', 'Pull back!'],
    cap:['Area secure!', 'We got it!', 'Raise the flag!'], new:['Reporting for duty!', 'Ready, sir!', 'Fresh off the boat!'],
    idle:['Got a smoke?', 'Anybody seen my letter?', 'K-rations again…', 'I\'d kill for a hot shower.', 'When\'s chow?', 'Kilroy was here.']},
  uk:{sel:['Sir!', 'Right-o!', 'Very good, sir!', 'On it, sir!', 'Moving up!'], veh:['Driver, advance!', 'Tally-ho!', 'Off we go!', 'Hold on to your hats!', 'Driver, advance — steady!'],
    move:['Come on, lads!', 'Keep your heads down!', 'Follow me, lads!', 'Pick it up!', 'Steady, steady…'], atk:['Fire!', 'Let \'em have it!', 'Engage!', 'Rapid fire!', 'Give \'em a bit of stick!'],
    kill:['Brewed up!', 'Good shooting!', 'He\'s burning!', 'Got the blighter!', 'Bang on!'], hurt:['Stretcher-bearer!', 'Bale out!', 'Take cover!', 'I\'ve been hit!', 'Bloody hell!'],
    cap:['Position taken, sir!', 'Ours now!', 'Jolly good!'], new:['Reporting, sir!', 'Ready for it, sir!'],
    idle:['Brew up, anyone?', 'Fancy a cuppa?', 'Bully beef again…', 'Roll on demob.', 'Who\'s got the char?', 'Lovely weather for it.']},
  su:{sel:['Есть!', 'Так точно!', 'Слушаюсь!', 'Понял!', 'Вперёд!'], veh:['Вперёд!', 'Полный ход!', 'Заводи!', 'Механик, вперёд!', 'Есть!'],
    move:['За мной!', 'Быстрее!', 'Вперёд, товарищи!', 'Не отставать!', 'Шире шаг!'], atk:['Огонь!', 'За Родину!', 'Ура!', 'Бей их!', 'Огонь по фашистам!'],
    kill:['Готов!', 'Горит!', 'Попал!', 'Есть один!', 'Капут фрицу!'], hurt:['Санитар!', 'Ложись!', 'Горим!', 'Меня ранило!', 'Ни шагу назад!'],
    cap:['Наше!', 'Взяли!', 'Знамя сюда!'], new:['Прибыл!', 'Готов к бою!'],
    idle:['Махорка есть?', 'Где же кухня?', 'Эх, Катюша…', 'Письмо бы из дома…', 'Холодно, братцы.', 'Скоро Берлин!']},
  fr:{sel:['Oui, mon général!', 'À vos ordres!', 'Compris!', 'Bien, mon lieutenant!', 'En avant!'], veh:['En avant!', 'Roulez!', 'Moteur!', 'Allez, allez!'],
    move:['Suivez-moi!', 'Plus vite!', 'Dispersez-vous!', 'Allez, les gars!'], atk:['Feu!', 'Tirez!', 'Pour la France!', 'Feu à volonté!', 'Vive la France!'],
    kill:['Touché!', 'Détruit!', 'Bien joué!', 'Il brûle!', 'En plein dans le mille!'], hurt:['Infirmier!', 'À couvert!', 'Repli!', 'Je suis touché!', 'Merde!'],
    cap:['Position prise!', 'C\'est à nous!', 'Libérée!'], new:['Présent!', 'À vos ordres!'],
    idle:['T\'as du feu?', 'Encore du singe…', 'Vivement la quille!', 'Paris nous attend.', 'Un petit café…']},
  pl:{sel:['Tak jest!', 'Rozkaz!', 'Zrozumiałem!', 'Według rozkazu!', 'Naprzód!'], veh:['Naprzód!', 'Jedziemy!', 'Pełny gaz!'],
    move:['Za mną!', 'Szybciej!', 'Naprzód, chłopcy!', 'Rozproszyć się!'], atk:['Ognia!', 'Pal!', 'Za Polskę!', 'Hurra!', 'Bij Niemca!'],
    kill:['Trafiony!', 'Płonie!', 'Mamy go!', 'Załatwiony!'], hurt:['Sanitariusz!', 'Kryj się!', 'Jestem ranny!', 'Padnij!'],
    cap:['Zajęte!', 'Nasze!'], new:['Melduję się!', 'Gotowi!'],
    idle:['Masz ognia?', 'Jeszcze Polska nie zginęła…', 'Kiedy do domu?', 'Zimno jak diabli.']},
  it:{sel:['Signorsì!', 'Agli ordini!', 'Comandi!', 'Subito!', 'Avanti!'], veh:['Avanti!', 'In marcia!', 'Motore!', 'Avanti tutta!'],
    move:['Seguitemi!', 'Avanti, ragazzi!', 'Più veloci!', 'Sparpagliatevi!'], atk:['Fuoco!', 'Tirate!', 'Avanti, Savoia!', 'Fuoco a volontà!'],
    kill:['Colpito!', 'Distrutto!', 'Preso!', 'Brucia!'], hurt:['Barelliere!', 'Al riparo!', 'Ritirata!', 'Sono ferito!', 'Mamma mia!'],
    cap:['Preso!', 'È nostro!'], new:['Presente!', 'Pronti!'],
    idle:['Hai da accendere?', 'Che caldo…', 'Ancora scatolette…', 'Quando si torna a casa?', 'Un caffè, magari…']},
  jp:{sel:['はい！', '了解！', '分かりました！', 'はっ！', '承知！'], veh:['前進！', '発進！', '戦車前へ！', 'はい！'],
    move:['前へ！', '続け！', '急げ！', '散開！'], atk:['撃て！', '突撃！', '万歳！', '撃ち方始め！', 'かかれ！'],
    kill:['撃破！', 'やった！', '命中！', '仕留めた！'], hurt:['衛生兵！', '伏せろ！', 'やられた！', '退け！'],
    cap:['占領！', '確保！', '万歳！'], new:['到着しました！', '準備よし！'],
    idle:['故郷が恋しい…', '腹が減った…', '煙草あるか？', '暑いな…', '雨か…']},
  cn:{sel:['是！', '明白！', '遵命！', '收到！'], veh:['前進！', '出發！', '是！'],
    move:['跟我來！', '快！', '前進！', '散開！'], atk:['開火！', '殺！', '衝啊！', '打！'],
    kill:['打中了！', '好！', '幹掉了！', '命中！'], hurt:['衛生兵！', '臥倒！', '我中彈了！', '隱蔽！'],
    cap:['佔領了！', '拿下了！'], new:['報到！', '準備好了！'],
    idle:['有火嗎？', '想家了…', '餓了…', '敵人在哪？', '這雨下個不停…']},
};
// variants: Marines call for a corpsman, the Belgians speak Flemish as well as French, the desert armies talk about sand
BARK_LINES.usp = {...BARK_LINES.us, hurt:['Corpsman!', 'Corpsman up!', 'Get down!', 'I\'m hit!'], idle:BARK_LINES.us.idle.concat(['Semper fi, Mac.', 'Another damn island…'])};
BARK_LINES.be = {...BARK_LINES.fr, sel:BARK_LINES.fr.sel.concat(['Ja, commandant!', 'Begrepen!']), atk:BARK_LINES.fr.atk.concat(['Vuur!', 'Schiet!']), move:BARK_LINES.fr.move.concat(['Vooruit!', 'Volg mij!'])};
BARK_LINES.fr40 = BARK_LINES.fr; BARK_LINES.ffl = BARK_LINES.fr;
BARK_LINES.dak = {...BARK_LINES.ger, idle:['Sand… überall Sand.', 'Wasser!', 'Für ein kühles Bier…', 'Diese Fliegen!', 'Hat einer Feuer?']};
BARK_LINES.uk42 = {...BARK_LINES.uk, idle:['Flies, flies, flies…', 'Bloody sand.', 'Brew up, lads?', 'Fancy a swim at Alex?', 'Bully beef again…']};
for (const [k, v] of Object.entries(BARK_LINES)) BARKS[k] = {...(BARKS[k] || {}), ...v};
for (const k of ['ger40']) BARKS[k] = BARKS.ger;
for (const k of ['uk40']) BARKS[k] = BARKS.uk;
for (const k of ['su41']) BARKS[k] = BARKS.su;
if (BARKS.zed) Object.assign(BARKS.zed, {move:['Hhhrrr…', 'Uuunnh…'], cap:['Hhhrrr…'], new:['Uuurgh…'], idle:['Hhhnnn…', 'Grrr…', 'Uuurrh…']});

/* idle talk: now and then, between the shooting, somebody on the map says something */
const CHATTER = {next:0};
function chatterTick() {
  const now = performance.now();
  if (now < CHATTER.next || FAST || !SET.fx || !G || G.over || document.body.dataset.screen !== 'game') return;
  CHATTER.next = now + 6000 + Math.random() * 9000;
  if (!$('#dialog').hidden || (typeof UI !== 'undefined' && UI.mode !== 'idle') || !$('#battlewrap').hidden) return;
  const pool = G.units.filter(u => u.d.foot && seen(u) && onScreen(u));
  if (pool.length) fxBark(pool[Math.random() * pool.length | 0], 'idle', {quiet:true});
}
const onScreen = u => { const [x, y] = T2W(u.x, u.y), sx = (x - cam.x) * cam.z, sy = (y - cam.y) * cam.z; return sx > 40 && sy > 60 && sx < innerWidth - 40 && sy < innerHeight - 140; };
setInterval(chatterTick, 1000);
