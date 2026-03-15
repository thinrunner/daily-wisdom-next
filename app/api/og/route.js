import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

const QUOTES = [
  { text: "Счастье твоей жизни зависит от качества твоих мыслей.", author: "Марк Аврелий", mood: "calm" },
  { text: "Ты властен над своим разумом, а не над внешними событиями.", author: "Марк Аврелий", mood: "strength" },
  { text: "Не трать время на споры о том, каким должен быть хороший человек. Будь им.", author: "Марк Аврелий", mood: "action" },
  { text: "Просыпаясь утром, думай о том, какая это драгоценная привилегия — жить.", author: "Марк Аврелий", mood: "joy" },
  { text: "Думай о красоте жизни. Смотри на звёзды.", author: "Марк Аврелий", mood: "cosmos" },
  { text: "Настоящий момент всегда будет существовавшим.", author: "Марк Аврелий", mood: "peace" },
  { text: "Смелый — значит свободный.", author: "Сенека", mood: "courage" },
  { text: "Удача — это когда подготовка встречает возможность.", author: "Сенека", mood: "action" },
  { text: "Мы страдаем больше в воображении, чем в действительности.", author: "Сенека", mood: "peace" },
  { text: "Пока мы откладываем жизнь на потом, она проходит мимо.", author: "Сенека", mood: "action" },
  { text: "Ищи добро не во внешних вещах, а в себе.", author: "Эпиктет", mood: "inner" },
  { text: "Сначала скажи себе, кем ты хочешь стать. А затем делай то, что необходимо.", author: "Эпиктет", mood: "action" },
  { text: "Не свободен тот, кто не владеет собой.", author: "Эпиктет", mood: "strength" },
  { text: "Людей расстраивают не вещи, а их мнения о вещах.", author: "Эпиктет", mood: "peace" },
  { text: "Разум — это всё. Ты становишься тем, о чём думаешь.", author: "Будда", mood: "inner" },
  { text: "Мир — внутри. Не ищи его снаружи.", author: "Будда", mood: "peace" },
  { text: "Не живи прошлым, не мечтай о будущем — сосредоточь ум на настоящем.", author: "Будда", mood: "calm" },
  { text: "Никто не спасёт нас, кроме нас самих.", author: "Будда", mood: "strength" },
  { text: "Пути к счастью нет — счастье и есть путь.", author: "Будда", mood: "joy" },
  { text: "Выбери работу, которую любишь, и тебе не придётся работать ни дня в жизни.", author: "Конфуций", mood: "purpose" },
  { text: "Не важно, как медленно ты идёшь, главное — не останавливаться.", author: "Конфуций", mood: "strength" },
  { text: "Иди туда, куда ведёт сердце.", author: "Конфуций", mood: "action" },
  { text: "Красота есть везде. Не все её видят.", author: "Конфуций", mood: "joy" },
  { text: "Слышу — и забываю. Вижу — и запоминаю. Делаю — и понимаю.", author: "Конфуций", mood: "action" },
  { text: "Молчание — источник великой силы.", author: "Лао-цзы", mood: "inner" },
  { text: "Природа не торопится, однако всё успевает.", author: "Лао-цзы", mood: "calm" },
  { text: "Путь в тысячу ли начинается с одного шага.", author: "Лао-цзы", mood: "action" },
  { text: "Победить других — сила. Победить себя — истинное могущество.", author: "Лао-цзы", mood: "strength" },
  { text: "Познать себя — начало всякой мудрости.", author: "Аристотель", mood: "inner" },
  { text: "Мы — это то, что мы делаем постоянно. Совершенство — не поступок, а привычка.", author: "Аристотель", mood: "action" },
  { text: "Удивление — начало мудрости.", author: "Сократ", mood: "growth" },
  { text: "Воображение важнее знания.", author: "Альберт Эйнштейн", mood: "creativity" },
  { text: "Человек, никогда не совершавший ошибок, никогда не пробовал ничего нового.", author: "Альберт Эйнштейн", mood: "growth" },
  { text: "Жизнь — как езда на велосипеде. Чтобы держать равновесие, нужно двигаться.", author: "Альберт Эйнштейн", mood: "vitality" },
  { text: "В середине каждой трудности таится возможность.", author: "Альберт Эйнштейн", mood: "growth" },
  { text: "Тот, у кого есть зачем жить, вынесет почти любое как.", author: "Фридрих Ницше", mood: "purpose" },
  { text: "То, что нас не убивает, делает нас сильнее.", author: "Фридрих Ницше", mood: "strength" },
  { text: "Хочешь быть счастливым — будь им.", author: "Лев Толстой", mood: "joy" },
  { text: "Красота спасёт мир.", author: "Фёдор Достоевский", mood: "creativity" },
  { text: "Мы все сделаны из звёздного вещества.", author: "Карл Саган", mood: "cosmos" },
  { text: "Для таких маленьких существ, как мы, только любовь делает огромность вселенной терпимой.", author: "Карл Саган", mood: "love" },
  { text: "Стань тем изменением, которое хочешь видеть в мире.", author: "Махатма Ганди", mood: "action" },
  { text: "Слабые не умеют прощать. Прощение — удел сильных.", author: "Махатма Ганди", mood: "strength" },
  { text: "Будущее зависит от того, что мы делаем сегодня.", author: "Махатма Ганди", mood: "action" },
  { text: "Вера — это сделать первый шаг, даже когда не видишь всей лестницы.", author: "Мартин Лютер Кинг", mood: "courage" },
  { text: "Тьму нельзя вытеснить тьмой — только свет на это способен.", author: "Мартин Лютер Кинг", mood: "truth" },
  { text: "Всё кажется невозможным — до тех пор, пока это не сделано.", author: "Нельсон Мандела", mood: "strength" },
  { text: "Я никогда не проигрываю. Я либо побеждаю, либо учусь.", author: "Нельсон Мандела", mood: "growth" },
  { text: "Единственный способ делать великую работу — любить то, что делаешь.", author: "Стив Джобс", mood: "purpose" },
  { text: "Твоё время ограничено, не трать его на жизнь чужой жизнью.", author: "Стив Джобс", mood: "action" },
  { text: "Оставайся голодным. Оставайся безрассудным.", author: "Стив Джобс", mood: "growth" },
  { text: "Успех — не финал, провал — не катастрофа. Смелость продолжать — вот что имеет значение.", author: "Уинстон Черчилль", mood: "strength" },
  { text: "Делай что можешь, с тем что имеешь, там где ты есть.", author: "Теодор Рузвельт", mood: "action" },
  { text: "Верь, что можешь — и ты уже на полпути к цели.", author: "Теодор Рузвельт", mood: "strength" },
  { text: "Через двадцать лет ты будешь больше сожалеть о том, чего не сделал.", author: "Марк Твен", mood: "action" },
  { text: "Люди забудут, что ты говорил, но никогда не забудут, что ты заставил их чувствовать.", author: "Майя Анджелоу", mood: "love" },
  { text: "Между стимулом и реакцией есть пространство. В этом пространстве — наша свобода.", author: "Виктор Франкл", mood: "inner" },
  { text: "Когда нельзя изменить ситуацию — нужно изменить себя.", author: "Виктор Франкл", mood: "growth" },
  { text: "Смысл жизни — найти свой дар. Цель жизни — подарить его миру.", author: "Пабло Пикассо", mood: "purpose" },
  { text: "Вдохновение существует, но оно должно застать тебя за работой.", author: "Пабло Пикассо", mood: "action" },
  { text: "Мир начинается с улыбки.", author: "Мать Тереза", mood: "peace" },
  { text: "Неси любовь повсюду. Пусть никто не уходит от тебя, не став счастливее.", author: "Мать Тереза", mood: "love" },
  { text: "Не все, кто блуждает, потеряны.", author: "Дж.Р.Р. Толкин", mood: "journey" },
  { text: "Даже самый маленький человек способен изменить ход будущего.", author: "Дж.Р.Р. Толкин", mood: "purpose" },
  { text: "Будь собой: все остальные роли уже заняты.", author: "Оскар Уайльд", mood: "inner" },
  { text: "Упал семь раз — встань восемь.", author: "Японская пословица", mood: "strength" },
  { text: "Дорогу осилит идущий.", author: "Народная мудрость", mood: "action" },
  { text: "Лучшее время посадить дерево было двадцать лет назад. Второе лучшее — сейчас.", author: "Китайская пословица", mood: "action" },
  { text: "Беги, когда можешь. Иди, если нужно. Ползи, если придётся. Но никогда не сдавайся.", author: "Дин Карназес", mood: "strength" },
  { text: "Твоё тело способно вынести почти всё. Убеди в этом свой разум.", author: "Народная мудрость", mood: "strength" },
  { text: "Один день или день первый. Ты решаешь.", author: "Народная мудрость", mood: "action" },
  { text: "Если вы думаете, что можете — вы правы. Если думаете, что не можете — тоже правы.", author: "Генри Форд", mood: "strength" },
  { text: "Неудача — это просто возможность начать заново, но уже умнее.", author: "Генри Форд", mood: "growth" },
  { text: "Жизнь — это то, что происходит с тобой, пока ты строишь другие планы.", author: "Джон Леннон", mood: "joy" },
  { text: "В глубине зимы я наконец понял, что внутри меня живёт непобедимое лето.", author: "Альберт Камю", mood: "strength" },
  { text: "Корабль в гавани в безопасности. Но корабли создаются не для этого.", author: "Народная мудрость", mood: "courage" },
  { text: "Не иди туда, куда ведёт путь. Иди туда, где пути нет, и оставь след.", author: "Ральф Эмерсон", mood: "courage" },
  { text: "Оставаться собой в мире, который постоянно пытается тебя переделать — величайшее достижение.", author: "Ральф Эмерсон", mood: "inner" },
  { text: "Ум, однажды расширившийся до новых идей, уже никогда не вернётся к прежним размерам.", author: "Ральф Эмерсон", mood: "growth" },
];

// Тёмные насыщенные цвета — те же что в lib/quotes.js
const MOOD_THEMES = {
  calm:       { bg: ["#1a1a2e", "#16213e"] },
  strength:   { bg: ["#3b1f3f", "#4e2354"] },
  joy:        { bg: ["#1e3d2f", "#265c40"] },
  action:     { bg: ["#1c2a4a", "#243660"] },
  peace:      { bg: ["#1a3030", "#1f3d3a"] },
  growth:     { bg: ["#1b2f45", "#1e3d5c"] },
  inner:      { bg: ["#2b1d42", "#3a2457"] },
  courage:    { bg: ["#3a2010", "#4f2e14"] },
  creativity: { bg: ["#3a1a3a", "#4e2052"] },
  nature:     { bg: ["#1a2e1c", "#1e3d22"] },
  cosmos:     { bg: ["#0e0e1f", "#141428"] },
  love:       { bg: ["#3a1a24", "#52202e"] },
  vitality:   { bg: ["#1a3024", "#1f4530"] },
  truth:      { bg: ["#192840", "#1e3354"] },
  purpose:    { bg: ["#1a3028", "#1e4034"] },
  journey:    { bg: ["#312515", "#45341c"] },
};

const MONTHS_RU = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  return Math.floor(diff / 86400000);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dayParam = searchParams.get('day');
  const date = new Date();
  const day = dayParam ? parseInt(dayParam) : getDayOfYear(date);
  const quote = QUOTES[day % QUOTES.length];
  const theme = MOOD_THEMES[quote.mood] || MOOD_THEMES.calm;

  const [color1, color2] = theme.bg;
  const dateStr = `${date.getDate()} ${MONTHS_RU[date.getMonth()]} ${date.getFullYear()}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Декоративный круг */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
          top: '-150px',
          right: '-150px',
          display: 'flex',
        }} />
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          bottom: '-80px',
          left: '-80px',
          display: 'flex',
        }} />

        {/* Карточка */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '32px',
          padding: '56px 72px',
          maxWidth: '860px',
          width: '860px',
          textAlign: 'center',
          boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
        }}>
          {/* Дата */}
          <div style={{
            fontSize: '13px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
            marginBottom: '28px',
            display: 'flex',
          }}>
            {dateStr} · День {day}
          </div>

          {/* Разделитель */}
          <div style={{
            width: '40px',
            height: '1px',
            background: 'rgba(255,255,255,0.2)',
            marginBottom: '24px',
            display: 'flex',
          }} />

          {/* Открывающая кавычка */}
          <div style={{
            fontSize: '90px',
            lineHeight: '0.5',
            color: 'rgba(255,255,255,0.1)',
            marginBottom: '20px',
            display: 'flex',
          }}>
            "
          </div>

          {/* Цитата */}
          <div style={{
            fontSize: quote.text.length > 80 ? '26px' : '30px',
            lineHeight: '1.6',
            color: '#ffffff',
            fontStyle: 'italic',
            marginBottom: '36px',
            display: 'flex',
            textAlign: 'center',
          }}>
            {quote.text}
          </div>

          {/* Разделитель */}
          <div style={{
            width: '40px',
            height: '1px',
            background: 'rgba(255,255,255,0.2)',
            marginBottom: '24px',
            display: 'flex',
          }} />

          {/* Автор */}
          <div style={{
            fontSize: '13px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
            display: 'flex',
          }}>
            {quote.author}
          </div>
        </div>

        {/* Брендинг */}
        <div style={{
          position: 'absolute',
          bottom: '28px',
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{
            fontSize: '13px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)',
            display: 'flex',
          }}>
            ✦ Мудрость дня
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
