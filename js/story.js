/* =========================================================
   스토리 데이터 — 1부 1페이즈: 진흙골의 아이
   각 장면: title, text(배열 또는 함수), choices, onEnter 등
   문단 타입: narr(서술) / speak(대사) / think(독백) / sys(시스템) / danger(위기)
   ========================================================= */
const STORY = {
  items: {
    boots: { name: "낡은 장화", desc: "한쪽 굽이 닳았지만 진흙을 막아준다." },
    stick: { name: "부러진 창대", desc: "막대기보다 조금 나은 무기." },
    spear: { name: "경비병의 창", desc: "정식 무장의 증거." },
    charm: { name: "마라의 매듭", desc: "회색 끈으로 엮은 부적. 청연의 기억을 닮았다." },
    bread: { name: "검은 빵 한 덩이", desc: "씹으면 모래가 섞였지만, 빵은 빵이다." },
    ledger: { name: "장부의 이름", desc: "이 세계에서 이름이 적혔다는 것은, 사람이 되었다는 뜻." },
  },

  scenes: {
    /* ---------- 도입: 환생 ---------- */
    intro: {
      title: "다시 태어나도 거지",
      phase: "1부 1페이즈",
      location: "진흙골",
      status: "진흙골의 아이",
      text: [
        { t: "think", c: "청연은 거지로 살다 죽었고, 다시 태어나서도 거지였다." },
        { t: "narr", c: "중원의 뒷골목. 개방의 말단 거지였던 청연은 굶주림과 매질 속에서 살다, 어느 겨울 다리 밑에서 조용히 식었다. 대단한 고수도, 협객도 아니었다. 다만 살아남는 법만큼은 무림 누구보다 지독하게 알았다." },
        { t: "narr", c: "그리고 눈을 떴다." },
        { t: "narr", c: "코를 찌르는 건 똥물과 썩은 짚 냄새. 머리 위로는 낯선 별이 떠 있었다. 그중 하나는 빛나지 않고, 오히려 주변의 별빛을 삼키는 듯 검었다. 진흙골(泥谷). 회색보리 마을 바깥, 도랑 너머의 빈민 취락." },
        { t: "sys", c: "당신은 로완. 열세 살. 장부에 이름조차 없는 무적자(無籍者). 이번 생의 목표는 거창하지 않다 — 그냥 굶어 죽지 않는 것." },
        { t: "think", c: "또 거지군. …그래. 거지면 어떠냐. 죽지만 않으면 된다." },
      ],
      choices: [
        { text: "몸을 일으킨다.", continue: true, next: "mud_morning" },
      ],
    },

    /* ---------- 풀죽 다툼: 첫 생존 + 눈치 판정 학습 ---------- */
    mud_morning: {
      title: "풀죽 한 솥",
      onEnter: (G) => { G.mod("hunger", -8); },
      text: [
        { t: "narr", c: "진흙골 한가운데, 깨진 솥에 멀건 풀죽이 끓는다. 누가 끓였는지는 중요하지 않다. 굶주린 자들이 몰려든다. 아이, 노인, 다리 저는 사내. 죽 한 솥에 열 개의 손이 달려든다." },
        { t: "narr", c: "당신의 배 속이 운다. 어제도, 그제도 제대로 먹지 못했다." },
        { t: "think", c: "정면으로 손을 들이밀면 큰 놈들에게 밀린다. 청연이라면… 가장 약한 흐름을 노렸겠지." },
      ],
      choices: [
        {
          text: "힘으로 비집고 들어가 한 그릇 챙긴다.",
          tag: "위험", tagType: "risk",
          effect: (G) => { G.mod("health", -10); G.mod("hunger", 14); G.mod("reputation", -2); },
          outcome: { type: "bad", text: "팔꿈치가 갈비뼈에 박힌다. 죽은 챙겼지만 멍이 들었고, 사람들은 당신을 '굶주린 들개'로 기억한다." },
          next: "after_porridge",
        },
        {
          text: "사람들의 빈틈을 읽어, 약한 쪽으로 파고든다.",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: 15 },
          onSuccess: {
            effect: (G) => { G.mod("hunger", 16); G.mod("awareness", 3); },
            outcome: { type: "good", text: "노파의 손이 떨리는 순간 그 옆을 파고든다. 아무도 밀치지 않고 죽 한 그릇이 손에 들어왔다. 이게 청연의 방식이다." },
            next: "after_porridge",
          },
          onFail: {
            effect: (G) => { G.mod("hunger", 5); G.mod("health", -4); },
            outcome: { type: "bad", text: "틈이라 생각한 곳이 함정이었다. 큰 사내의 어깨에 튕겨 진흙에 나뒹군다. 식은 죽 몇 모금이 전부다." },
            next: "after_porridge",
          },
        },
        {
          text: "솥을 포기하고 늙은 마라를 찾아간다.",
          effect: (G) => { G.setFlag("sought_mara"); },
          next: "mara",
        },
      ],
    },

    mara: {
      title: "늙은 마라",
      text: [
        { t: "narr", c: "도랑 끝, 비스듬히 기운 판잣집. 늙은 마라가 자기 몫의 죽을 절반쯤 떠서 이 빠진 그릇에 담는다. 친어머니는 아니다. 그저 진흙골의 아이들을 되는대로 거둬 먹이는 늙은 여자." },
        { t: "speak", c: "“또 못 비집고 왔구나. 미련한 놈. …그래도 안 맞고 온 게 어디냐.”" },
        { t: "narr", c: "그녀는 회색 끈으로 엮은 작은 매듭을 당신 손에 쥐여준다. 청연의 손이 기억하는 개방의 매듭과 어딘가 닮았다." },
        { t: "speak", c: "“살아. 착하게 살 생각 말고, 일단 살아.”" },
      ],
      onEnter: (G) => { G.mod("hunger", 12); G.give("charm"); G.setFlag("mara_known"); },
      choices: [
        { text: "매듭을 꼭 쥔다. 일거리를 찾아 마을로 간다.", continue: true, next: "to_village" },
      ],
    },

    after_porridge: {
      title: "도랑 너머",
      text: [
        { t: "narr", c: "배 속의 비명이 잦아들자, 비로소 생각할 여유가 생긴다. 진흙골에서 죽 한 그릇은 오늘의 목숨이다. 하지만 내일은? 모레는?" },
        { t: "think", c: "여기 머물면 결국 겨울에 얼어 죽는다. 도랑 너머, 회색보리 마을. 경비초소에서 잡역이라도 구해야 한다. 손에 흙 묻히는 일이라면 뭐든." },
        { t: "narr", c: "당신은 닳은 짚신을 고쳐 신고 도랑을 건넌다." },
      ],
      choices: [
        { text: "회색보리 마을로 향한다.", continue: true, next: "to_village" },
      ],
    },

    /* ---------- 마을 진입: 고구마(몰트) ---------- */
    to_village: {
      title: "회색보리 마을",
      location: "회색보리 마을",
      onEnter: (G) => { G.mod("hunger", -5); },
      text: [
        { t: "narr", c: "낮은 목책, 감시탑 둘, 보리밭과 순무밭. 시장이라 부르기 민망한 공터와 낡은 곡물창고. 진흙골에 비하면 이곳은 거의 성(城)이다." },
        { t: "narr", c: "경비초소 앞. 선임병 몰트가 창대로 길을 막는다. 그의 눈이 당신의 진흙투성이 발을 훑는다." },
        { t: "speak", c: "“진흙골 새끼가 여긴 뭐 하러 기어 왔어? 막대기 든 거지가 병사라도 되려고?”" },
      ],
      choices: [
        {
          text: "고개를 숙이고 굽신거린다. 체면보다 밥이다.",
          effect: (G) => { G.mod("reputation", -1); G.setFlag("molt_met"); G.mod("awareness", 2); },
          outcome: { type: "neutral", text: "당신은 비굴할 만큼 납작 엎드린다. 몰트는 시시하다는 듯 비웃지만, 그 사이 당신의 눈은 초소 안의 사정을 모두 읽었다. 비굴함은 청연의 무기다." },
          next: "meet_bram",
        },
        {
          text: "맞받아친다. “거지라도 두 손은 멀쩡합니다.”",
          tag: "위험", tagType: "risk",
          effect: (G) => { G.mod("health", -8); G.mod("reputation", 2); G.setFlag("molt_grudge"); },
          outcome: { type: "bad", text: "창대가 어깨를 후려친다. 진흙에 처박혔지만, 멀리서 신참 요나가 그 광경을 흥미롭게 지켜본다. 맞은 값으로 배짱만은 알려졌다." },
          next: "meet_bram",
        },
      ],
    },

    meet_bram: {
      title: "경비대장 브람",
      text: [
        { t: "narr", c: "초소 안, 절뚝이는 다리에 낡은 가죽갑옷. 회색 수염의 사내가 피곤한 얼굴로 당신을 본다. 경비대장 브람." },
        { t: "speak", c: "“일거리? …마침 손이 모자라긴 하지. 물 긷고, 창고 치우고, 시키는 거 한다. 급료는 없고, 저녁에 식은 죽 한 그릇. 싫으면 도랑으로 돌아가.”" },
        { t: "think", c: "급료 없는 잡역. 그래도 죽 한 그릇이 어디냐. 그리고 이 안에 들어가야, 이름을 올릴 기회도 생긴다." },
      ],
      onEnter: (G) => { G.setStatus("경비대 잡역"); },
      choices: [
        {
          text: "“하겠습니다.” 고개를 숙인다.",
          effect: (G) => { G.give("stick"); G.setFlag("hired"); },
          next: "chores",
        },
      ],
    },

    /* ---------- 잡역 중 이상 징후 발견 (핵심 눈치 판정) ---------- */
    chores: {
      title: "곡물창고의 그림자",
      onEnter: (G) => { G.mod("hunger", -6); G.nextDay(); },
      text: [
        { t: "narr", c: "사흘이 지났다. 물을 긷고, 똥통을 비우고, 창고 바닥의 쥐를 잡았다. 병사들은 당신을 '진흙골 잡것'이라 부르지만, 적어도 저녁마다 죽은 나온다." },
        { t: "narr", c: "오늘도 곡물창고 뒤편을 쓸던 중, 무언가 거슬린다. 청연의 등줄기가 서늘해지는, 그 느낌." },
        { t: "think", c: "…뭔가 어긋났다. 평소와 다른 게 있다. 그게 뭐지?" },
      ],
      choices: [
        {
          text: "걸음을 멈추고, 주변을 천천히 읽는다.",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: 10 },
          onSuccess: {
            effect: (G) => { G.setFlag("evidence"); G.mod("awareness", 4); },
            outcome: { type: "good", text: "창고 뒤 진창에 낯선 발자국 여럿. 마을 사람의 닳은 짚신이 아니라, 잘 만든 가죽 군화 자국이다. 창고 자물쇠 옆엔 긁힌 흔적. 누군가 안을 들여다봤다. 그것도 한 명이 아니다." },
            next: "decide_report",
          },
          onFail: {
            effect: (G) => { G.mod("awareness", 2); },
            outcome: { type: "neutral", text: "분명 뭔가 거슬리는데, 정체를 잡지 못한다. 불길한 느낌만 명치에 얹힌다. 그래도 청연의 감각은 거짓말을 하지 않는다 — 무언가 다가오고 있다." },
            next: "decide_report",
          },
        },
      ],
    },

    decide_report: {
      title: "고할 것인가",
      text: (G) => {
        const arr = [
          { t: "narr", c: "선택해야 한다. 무적자였던 시절, 괜한 참견은 매질로 돌아왔다. 입을 다무는 게 사는 법이었다. 하지만 이번엔…" },
        ];
        if (G.flag("evidence")) {
          arr.push({ t: "think", c: "발자국, 긁힌 자물쇠. 증거는 분명하다. 식량창고를 노리는 자들이 있다. 며칠 안에 일이 터진다." });
        } else {
          arr.push({ t: "think", c: "확실한 건 없다. 그저 등이 서늘할 뿐. 이 느낌만으로 사람을 움직일 수 있을까." });
        }
        return arr;
      },
      choices: [
        {
          text: "경비대장 브람에게 알린다.",
          next: "warn_bram",
        },
        {
          text: "밤에 직접 창고를 더 살핀다.",
          tag: "위험", tagType: "risk",
          check: { stat: "awareness", bonus: 5 },
          onSuccess: {
            effect: (G) => { G.setFlag("evidence"); G.setFlag("scouted"); G.mod("awareness", 5); },
            outcome: { type: "good", text: "달도 없는 밤, 진창에 배를 깔고 기다린다. 새벽녘, 그림자 셋이 창고를 돌며 자물쇠와 목책의 약한 곳을 표시한다. 외부인이다. 내일이나 모레, 분명히 온다. 이제 확신이 섰다." },
            next: "warn_bram",
          },
          onFail: {
            effect: (G) => { G.mod("health", -14); G.setFlag("evidence"); },
            outcome: { type: "bad", text: "어둠 속을 더듬다 누군가의 발을 밟았다. 둔기가 옆구리를 강타한다. 가까스로 굴러 도망쳤지만, 갈비뼈가 부러진 듯하다. 그래도 — 놈들의 얼굴은 봤다." },
            next: "warn_bram",
          },
        },
        {
          text: "입을 다문다. 괜한 참견은 화를 부른다.",
          effect: (G) => { G.setFlag("stayed_silent"); },
          outcome: { type: "neutral", text: "당신은 빗자루를 들고 자리를 뜬다. 청연의 본능이 속삭인다 — 무적자는 끼어들지 않는다. 하지만 등 뒤의 서늘함은 가시지 않는다." },
          next: "raid_unprepared",
        },
      ],
    },

    warn_bram: {
      title: "고변(告變)",
      text: [
        { t: "narr", c: "당신은 브람 앞에 선다. 몰트가 코웃음을 친다." },
        { t: "speak", c: "“창고가 털릴 겁니다. 외부에서 온 자들이 자물쇠와 목책을 살피고 갔습니다.”" },
        { t: "narr", c: "브람의 피곤한 눈이 가늘어진다. 그는 당신을 믿을 이유가 없다. 진흙골 잡것의 말 한마디로 병사를 움직일 순 없다." },
      ],
      choices: [
        {
          text: "본 것을 차분히, 구체적으로 설명한다.",
          tag: "설득 판정", tagType: "info",
          check: {
            stat: "awareness",
            bonus: (G) => {
              let b = 5;
              if (G.flag("evidence")) b += 25;
              if (G.flag("scouted")) b += 15;
              if (G.s.stats.reputation > 5) b += 5;
              return b;
            },
          },
          onSuccess: {
            effect: (G) => { G.setFlag("bram_convinced"); G.mod("reputation", 6); G.mod("awareness", 2); },
            outcome: { type: "good", text: "“가죽 군화 자국, 자물쇠 옆 긁힘, 새벽의 그림자 셋.” 당신의 말은 짐작이 아니라 관찰이었다. 브람의 표정이 굳는다. “…네 말이 맞다면, 우린 준비를 해야겠지.” 그가 처음으로 당신을 똑바로 본다." },
            next: "raid_prepared",
          },
          onFail: {
            effect: (G) => { G.mod("reputation", -1); },
            outcome: { type: "bad", text: "확신 없는 말은 힘이 없다. 브람은 한숨을 쉰다. “느낌이라. …바빠. 가서 네 일이나 해.” 몰트가 비웃는다. 하지만 브람의 눈 한구석엔 작은 의심이 남았다." },
            next: "raid_semi",
          },
        },
        {
          text: "그냥 물러난다.",
          effect: (G) => { G.setFlag("stayed_silent"); },
          next: "raid_unprepared",
        },
      ],
    },

    /* ---------- 식량창고 습격 ---------- */
    raid_prepared: {
      title: "습격",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -6); },
      text: [
        { t: "narr", c: "이튿날 밤. 브람은 미리 병사 넷을 창고 그늘에 숨겼다. 자정이 지나자, 목책 너머에서 그림자들이 미끄러져 든다. 도적이라기엔 너무 조직적이다. 인신매매단의 무리." },
        { t: "danger", c: "“놈들이다!” 브람의 신호와 함께 횃불이 일제히 타오른다." },
        { t: "narr", c: "혼란 속, 당신의 눈은 전체를 본다. 정면에서 부딪치는 병사들 너머 — 무리 일부가 빠진다. 창고가 아니라, 빈민 아이들이 모여 자는 헛간 쪽으로." },
      ],
      choices: [
        {
          text: "헛간으로 새는 무리를 브람에게 외친다.",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: 25 },
          onSuccess: {
            effect: (G) => { G.setFlag("saved_children"); G.mod("reputation", 12); G.mod("awareness", 4); },
            outcome: { type: "good", text: "“헛간! 애들을 노린다!” 당신의 외침에 브람이 즉시 둘을 돌린다. 헛간 문턱에서 매매단의 손이 아이의 멱살을 잡기 직전, 창대가 그 팔을 부러뜨린다. 식량이 아니라 아이들이 진짜 목표였다. 당신만이 그것을 봤다." },
            next: "raid_resolve",
          },
          onFail: {
            effect: (G) => { G.mod("health", -10); G.mod("reputation", 4); },
            outcome: { type: "bad", text: "당신은 직접 뛰어들지만 한발 늦었다. 아이 둘이 자루에 담겨 사라졌다. 나머지는 막았지만, 빈자리가 명치를 짓누른다. 그래도 더 큰 참사는 막았다." },
            next: "raid_resolve",
          },
        },
        {
          text: "정면의 싸움에 가세한다.",
          effect: (G) => { G.mod("health", -12); G.mod("reputation", 3); G.setFlag("kids_taken"); },
          outcome: { type: "bad", text: "당신은 창대를 휘둘러 한 놈을 넘어뜨린다. 무장병으로서 첫 활약이다. 하지만 그 사이 헛간 쪽에서 비명이 들린다 — 아이 몇이 끌려갔다. 정면만 보는 자는 옆구리를 내준다." },
          next: "raid_resolve",
        },
      ],
    },

    raid_semi: {
      title: "습격",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -6); },
      text: [
        { t: "narr", c: "브람은 당신의 말을 흘려들었지만, 완전히 무시하지도 못했다. 그날 밤, 그는 평소보다 한 명을 더 깨워 두었다." },
        { t: "danger", c: "자정 무렵, 목책이 소리 없이 넘어가고 그림자들이 창고로 든다. 잠든 마을이 늦게야 깨어난다." },
        { t: "narr", c: "당신은 빗자루 대신 부러진 창대를 쥐고 달려 나간다. 혼란 속에서 무리 일부가 헛간으로 빠지는 게 보인다." },
      ],
      choices: [
        {
          text: "직접 헛간을 막아선다.",
          tag: "위험", tagType: "risk",
          check: { stat: "awareness", bonus: 15 },
          onSuccess: {
            effect: (G) => { G.setFlag("saved_children"); G.mod("reputation", 10); G.mod("health", -6); },
            outcome: { type: "good", text: "당신은 헛간 문턱을 막고 창대를 비스듬히 세운다. 좁은 입구에서는 머릿수가 소용없다. 청연의 봉술 잔재가 손끝에 살아난다. 비명을 들은 병사들이 합류할 때까지, 당신은 버텼다." },
            next: "raid_resolve",
          },
          onFail: {
            effect: (G) => { G.mod("health", -16); G.mod("reputation", 5); G.setFlag("kids_taken"); },
            outcome: { type: "bad", text: "혼자서는 무리였다. 두들겨 맞고 쓰러진다. 끌려가던 아이 하나는 구했지만, 나머지는 어둠 속으로 사라졌다. 입술에서 피 맛이 난다." },
            next: "raid_resolve",
          },
        },
      ],
    },

    raid_unprepared: {
      title: "준비 없는 밤",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -6); },
      text: [
        { t: "danger", c: "사흘 뒤 자정. 비명으로 잠이 깬다. 횃불, 연기, 무너지는 목책. 아무도 대비하지 않았다. 식량창고가 불타고, 헛간에서는 아이들이 끌려간다." },
        { t: "think", c: "…알고 있었다. 입을 다물어서, 이 꼴이 났다. 무적자는 끼어들지 않는다고? 그 대가가 이거다." },
        { t: "narr", c: "당신은 부러진 창대를 쥐고 어둠 속으로 뛰어든다. 너무 늦었지만, 아무것도 안 할 수는 없다." },
      ],
      choices: [
        {
          text: "혼란 속에서 한 명이라도 구한다.",
          tag: "위험", tagType: "risk",
          check: { stat: "awareness", bonus: 5 },
          onSuccess: {
            effect: (G) => { G.mod("health", -12); G.mod("reputation", 4); G.setFlag("kids_taken"); },
            outcome: { type: "bad", text: "연기 속을 기어, 자루에 담기던 아이 하나를 끌어낸다. 단 하나. 나머지는 구하지 못했다. 마을은 그날의 손실을 당신 탓으로 돌리진 않았지만, 당신은 안다 — 막을 수 있었다." },
            next: "raid_resolve",
          },
          onFail: {
            effect: (G) => { G.mod("health", -22); G.setFlag("kids_taken"); },
            outcome: { type: "bad", text: "어둠과 불길 속에서 길을 잃는다. 둔기가 뒤통수를 친다. 정신을 잃기 직전, 끌려가는 아이들의 울음이 멀어진다. 당신이 살아남은 건 운이었다." },
            next: "raid_resolve",
          },
        },
      ],
    },

    raid_resolve: {
      title: "잿더미 아침",
      text: (G) => {
        const arr = [
          { t: "narr", c: "동이 튼다. 매캐한 연기 사이로 마을이 피해를 셈한다." },
        ];
        if (G.flag("saved_children")) {
          arr.push({ t: "narr", c: "창고는 지켰고, 아이들은 무사하다. 브람이 그을음 묻은 얼굴로 당신 앞에 선다. 그의 눈빛이 어제와 다르다." });
          arr.push({ t: "speak", c: "“네가 옳았다. 네가 아니었으면 헛간이 통째로 비었겠지. …검은 못 쓰는 놈이, 이상하게 죽을 자리를 먼저 본단 말이야.”" });
        } else if (G.flag("kids_taken")) {
          arr.push({ t: "narr", c: "창고의 절반은 탔고, 아이 몇은 끝내 돌아오지 못했다. 무거운 침묵 속에서, 그래도 브람은 당신을 기억한다." });
          arr.push({ t: "speak", c: "“넌 도망치지 않았어. 그거면 됐다. …다음엔 더 빨리 봐라. 넌 그게 되는 놈 같으니까.”" });
        } else {
          arr.push({ t: "narr", c: "당신의 경고 덕에 최악은 면했다. 브람이 당신을 돌아본다." });
          arr.push({ t: "speak", c: "“진흙골 잡것치곤 눈이 밝아. 쓸 만하다는 뜻이다.”" });
        }
        return arr;
      },
      choices: [
        { text: "브람의 말을 듣는다.", continue: true, next: "first_reward" },
      ],
    },

    /* ---------- 첫 보상: 빵, 이름 ---------- */
    first_reward: {
      title: "빵 한 덩이와 이름 한 줄",
      onEnter: (G) => {
        G.mod("hunger", 20); G.addRation(1); G.give("bread"); G.give("boots");
        G.mod("reputation", 5); G.setStatus("경비대 말단");
      },
      text: [
        { t: "narr", c: "브람이 검은 빵 한 덩이와 배급권 한 장, 그리고 누군가 신다 만 낡은 장화를 던진다. 진흙골에서는 평생 만져보지 못할 재산이다." },
        { t: "speak", c: "“오늘부터 잡역이 아니라 말단 병졸로 친다. 죽 말고 빵이 나온다. 그리고—”" },
        { t: "narr", c: "그가 기름때 묻은 장부를 펼쳐, 거칠게 한 줄을 적는다." },
        { t: "speak", c: "“로완. 진흙골. 경비병. …이제 네 이름이 적혔다. 죽어도 장부에 한 줄은 남는다는 뜻이야.”" },
        { t: "think", c: "이름. 청연으로도, 로완으로도, 처음 가져보는 것. 이 세계에서 이름이 적힌다는 건 — 비로소 사람이 된다는 뜻이다." },
      ],
      choices: [
        { text: "장화를 신는다. 발이 따뜻하다.", effect: (G) => { G.give("ledger"); }, continue: true, next: "interlude" },
      ],
    },

    interlude: {
      title: "겨울의 한복판",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -4); },
      text: [
        { t: "narr", c: "며칠이 흐른다. 당신은 창 잡는 법을 배우고, 신참 요나와 같은 줄에 선다. 요나는 처음엔 '진흙골 놈'이라며 비웃었지만, 습격의 밤 이후로는 입을 다물었다." },
        { t: "speak", c: "“…너 같은 놈이랑 같은 줄에 서라고? 세상 진짜 망했네.” 요나가 투덜대면서도, 당신 옆을 떠나지 않는다." },
        { t: "narr", c: "그러나 평온은 짧다. 북부에서 밀려온 피난민들이 마을 밖에 진을 치고, 그들을 따라온 굶주린 늑대떼와 도적들이 어둠 속에서 마을을 노린다. 그리고 하늘의 검은 별은, 조금 더 또렷해졌다." },
        { t: "danger", c: "겨울 깊은 밤, 비상종이 울린다. 마을 방어전이 시작된다." },
      ],
      choices: [
        { text: "창을 쥐고 감시탑으로 달려간다.", continue: true, next: "defense" },
      ],
    },

    /* ---------- 1페이즈 결말: 마을 방어전 ---------- */
    defense: {
      title: "감시탑의 밤",
      onEnter: (G) => { G.give("spear"); G.setStatus("경비병"); },
      text: [
        { t: "narr", c: "감시탑 위. 아래에서는 도적과 늑대떼가 정문을 두드리고, 경비대 전원이 그곳으로 몰린다. 정문의 함성이 밤을 찢는다." },
        { t: "narr", c: "당신은 창을 쥐고 정문으로 달려가려다 — 멈춘다. 청연의 등줄기가 다시 서늘하다. 모두가 정문을 본다. 모두가." },
        { t: "think", c: "정문이 너무… 시끄럽다. 적이 정말 여길 뚫으려 한다면, 이렇게 요란하게? 시선을 끄는 거다. 그럼 진짜는 어디로 든다?" },
      ],
      choices: [
        {
          text: "정문으로 가지 않고, 어둠에 잠긴 마을 뒤편을 살핀다.",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: 30 },
          onSuccess: {
            effect: (G) => { G.setFlag("defense_win"); G.mod("reputation", 18); G.mod("awareness", 5); },
            outcome: { type: "good", text: "어둠 속, 마을 뒤편 무너진 목책 틈으로 그림자 한 무리가 소리 없이 스며든다. 정문은 미끼였다. 당신은 비상종을 미친 듯이 두드리고, 좁은 골목으로 그들을 유인한다 — 청연이 뒷골목에서 익힌, 죽을 자리를 피하고 적을 가두는 법으로. 우회 침입은 그 골목에서 막혔다." },
            next: "phase1_end",
          },
          onFail: {
            effect: (G) => { G.mod("health", -18); G.setFlag("defense_partial"); G.mod("reputation", 8); },
            outcome: { type: "bad", text: "당신은 뒤편으로 달렸지만, 우회한 무리는 이미 안으로 들었다. 좁은 골목에서 홀로 셋을 상대한다. 창대가 부러지고 피를 흘리면서도 비상종까지 버텼다. 경비대가 달려와 겨우 막았다 — 당신의 외침이 한 박자 늦었을 뿐, 마을은 살았다." },
            next: "phase1_end",
          },
        },
        {
          text: "동료들과 함께 정문을 지킨다.",
          effect: (G) => { G.mod("health", -10); G.mod("reputation", 4); G.setFlag("defense_front"); },
          outcome: { type: "bad", text: "당신은 정문에서 용감히 싸운다. 하지만 새벽녘, 마을 뒤편 가옥 몇 채가 불탄 것이 드러난다. 적의 본대는 그쪽으로 들었던 것이다. 정문만 본 대가다. 그래도 마을은, 가까스로 살아남았다." },
          next: "phase1_end",
        },
      ],
    },

    phase1_end: {
      title: "살아남은 놈",
      onEnter: (G) => { G.mod("hunger", 10); G.addRation(2); G.mod("health", 10); },
      text: (G) => {
        const arr = [
          { t: "narr", c: "아침이 온다. 마을은 그을렸지만, 서 있다. 사람들이 죽은 자를 묻고, 산 자를 센다." },
        ];
        if (G.flag("defense_win")) {
          arr.push({ t: "narr", c: "경비대 전원이 정문에 묶여 있던 사이, 마을을 통째로 비울 뻔한 우회 침입을 막은 건 당신 하나였다. 그 사실을 모두가 안다." });
          arr.push({ t: "speak", c: "브람: “네가 감시탑을 안 버렸으면, 우린 등 뒤에서 몰살당했다. …넌 검은 못 써. 그런데 이상하게, 죽을 자리를 먼저 본단 말이야.”" });
        } else {
          arr.push({ t: "narr", c: "완벽하진 않았다. 피해도 있었다. 하지만 당신이 한 박자 빨리 위험을 알아챘기에, 마을은 몰살을 면했다." });
          arr.push({ t: "speak", c: "브람: “넌 명예로운 병사는 아니다. 하지만 살아남았고, 사람들을 살렸어. 그거면 충분하다.”" });
        }
        arr.push({ t: "narr", c: "브람이 장부를 다시 펼친다. 이번엔 거칠게가 아니라, 또박또박." });
        arr.push({ t: "speak", c: "“로완. 정식 경비병으로 등록한다. 남작령에 보고할 때도 '징집 대상'이 아니라 '쓸 만한 병사'라고 적겠다.”" });
        arr.push({ t: "think", c: "그날 로완은 알았다. 이 세계에서 빵 한 덩이는 목숨이고, 이름 한 줄은 신분이었다. 그리고 그는, 둘 다 손에 넣었다." });
        return arr;
      },
      choices: [
        { text: "장부에 적히는 자신의 이름을 본다.", effect: (G) => { G.setStatus("정식 경비병"); }, continue: true, next: "phase1_epilogue" },
      ],
    },

    phase1_epilogue: {
      title: "— 1페이즈 종료 —",
      submit: { result: "1페이즈 클리어" },
      text: (G) => {
        const score = G.s.stats.reputation;
        const arr = [
          { t: "sys", c: "【 1부: 빵 한 덩이와 창 한 자루 — 1페이즈 「진흙골의 아이」 클리어 】" },
          { t: "narr", c: "무적자였던 진흙골의 아이는, 이제 장부에 이름이 적힌 정식 경비병이 되었다. 강해서 올라간 것이 아니다. 그저 위험을 먼저 알아보았고, 도망치지 않았을 뿐이다." },
          { t: "sys", c: "최종 평판 " + score + " · 생존 일수 " + G.s.day + "일 · 눈치 " + G.s.stats.awareness },
        ];
        if (G.flag("saved_children")) arr.push({ t: "sys", c: "기록: 인신매매단으로부터 진흙골 아이들을 구했다." });
        if (G.flag("defense_win")) arr.push({ t: "sys", c: "기록: 우회 침입을 단독으로 간파해 마을을 구했다. — '죽을 자리를 먼저 보는 놈'이라는 평판을 얻었다." });
        arr.push({ t: "think", c: "다음은 남작의 성채다. 촌놈 병사에서 진짜 무장병으로. …하지만 그건, 또 다른 겨울의 이야기다." });
        return arr;
      },
      choices: [
        { text: "남작령의 차출 명령서를 받는다. (2페이즈 →)", continue: true, next: "p2_intro" },
        { text: "여기까지의 여정을 되새긴다. (타이틀로)", action: "title" },
      ],
    },

    /* =====================================================
       2부 진입 — 1부 2페이즈 「남작의 개」
       ===================================================== */
    p2_intro: {
      title: "남작의 개",
      phase: "1부 2페이즈",
      location: "하윈 성채",
      status: "남작 근위대 대원",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -6); },
      text: [
        { t: "sys", c: "【 1부 2페이즈 「남작의 개」 】" },
        { t: "narr", c: "회색보리 마을의 보고가 위로 올라갔다. '쓸 만한 병사'. 그 한 줄 덕에, 로완은 요나와 함께 하윈 남작령의 작은 성채로 차출되었다." },
        { t: "narr", c: "돌담 일부는 갈라졌고 말은 부족하다. 병사들의 장비는 제각각. 그래도 진흙골과 회색보리에 비하면, 이곳은 권력의 한복판이다." },
        { t: "speak", c: "요나: “감시탑 지키던 진흙골 놈이 남작님 성에 들어오다니. …세상 진짜 망했어. 근데 뭐, 같이 굶는 것보단 낫지.”" },
        { t: "narr", c: "노병 가렌이 창 한 자루를 던진다. 검도, 명예도 아닌, 변경 병사의 무기." },
        { t: "speak", c: "가렌: “검술은 기사님들 놀이야. 너 같은 놈은 창을 잡아. 멀리서 찔러야 오래 산다.”" },
      ],
      choices: [
        { text: "창을 받아 쥔다.", effect: (G) => { G.give("spear"); G.setFlag("yona_ally"); }, continue: true, next: "p2_castle" },
      ],
    },

    p2_castle: {
      title: "성채의 계급",
      onEnter: (G) => { G.mod("hunger", -5); G.nextDay(); },
      text: [
        { t: "narr", c: "성채 생활은 또 다른 진흙골이다. 기사들은 종자를 부리고, 정규병은 잡병을 무시하고, 잡병은 진흙골 출신을 밟는다. 글자도 명령 체계도 낯설다." },
        { t: "narr", c: "남작의 딸 세리아가, 명령서를 읽지 못해 쩔쩔매는 병사들을 한심하게 본다. 그녀의 눈이 로완에게 멈춘다." },
        { t: "speak", c: "세리아: “…너. 글자를 배우고 싶으냐? 천한 출신은 죄가 아니지만, 천한 머리로 남는 건 네 선택이다.”" },
      ],
      choices: [
        {
          text: "글자와 명령 체계를 배운다.",
          effect: (G) => { G.mod("awareness", 4); G.mod("reputation", 2); G.setFlag("literate"); },
          outcome: { type: "good", text: "밤마다 세리아에게 글자를 배운다. 청연의 머리는 빠르다. 명령서, 보급 장부, 전령의 표식 — 글을 읽자 전장이 다르게 보이기 시작한다." },
          next: "p2_castle2",
        },
        {
          text: "글자보다 사람을 읽는다. 하인과 마부에게 붙는다.",
          effect: (G) => { G.mod("awareness", 5); G.setFlag("kitchen_eyes"); },
          outcome: { type: "good", text: "마구간, 부엌, 빨래터. 낮은 사람들의 입에서 성채의 진짜 사정이 흘러나온다 — 누가 급료를 떼이고, 어느 보급이 비고, 어떤 기사가 겁쟁이인지. 청연의 개방식 눈치가 자산이 된다." },
          next: "p2_castle2",
        },
      ],
    },

    p2_castle2: {
      title: "수상한 정적",
      text: [
        { t: "narr", c: "며칠 후, 남작 에드릭 하윈이 병사들을 모은다. 마른 얼굴, 깊게 팬 눈가. 검소하지만 무능하진 않은 귀족이다." },
        { t: "speak", c: "하윈: “영지 외곽에 잿빛 늑대 무리가 돌고, 그 뒤로 도적이 따라붙는다. 나는 네게 명예를 기대하지 않는다. 결과를 기대한다. 가서 길목을 정리해라.”" },
        { t: "narr", c: "순찰 사흘째. 마른 풀밭에 들어선 순간, 청연의 등줄기가 또 그 서늘함을 보낸다. 바람에 실린 짐승 냄새. 그리고 — 사방의 정적." },
        { t: "think", c: "늑대는 무리로 사냥한다. 한 마리가 시선을 끄는 동안, 나머지는 옆구리로 돈다. …이미 둘러싸였다." },
      ],
      choices: [
        {
          text: "횃불을 들고 등을 바위에 붙인다. 사각을 지운다.",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: 20 },
          onSuccess: {
            effect: (G) => { G.setFlag("wolf_ready"); G.mod("awareness", 2); },
            outcome: { type: "good", text: "당신은 바위벽을 등지고 횃불을 세운다. 무리가 뒤로 돌 길이 막혔다. 늑대들은 불빛을 꺼린다. 유리한 자리를 먼저 잡았다. (전투에서 회피 보너스)" },
            next: "p2_wolves",
          },
          onFail: {
            outcome: { type: "bad", text: "자리를 잡기 전에 풀숲이 일제히 흔들린다. 늑대 떼가 사방에서 일어난다. 평지에서, 둘러싸인 채로 맞아야 한다." },
            next: "p2_wolves",
          },
        },
      ],
    },

    p2_wolves: {
      combat: {
        enemy: {
          name: "잿빛 늑대 무리",
          grade: "1등급 소형 · 무리",
          maxHp: 28,
          weakness: "두목의 목",
          intro: [
            { t: "danger", c: "붉은 눈 여섯 쌍이 풀숲에서 떠오른다. 두목으로 보이는 큰 놈이 앞에 선다." },
            { t: "think", c: "두목을 꺾으면 나머지는 흩어진다. 무리 사냥의 약점은, 무리를 묶는 한 마리다." },
          ],
          moves: [
            { type: "light", name: "측면 물기", dmg: 7, weight: 3 },
            { type: "heavy", name: "일제 강습", tell: "늑대들이 한 점으로 몰려든다 — 일제 강습 준비!", dmg: 15, weight: 2 },
            { type: "guarded", name: "두목이 으르렁대며 무리를 다잡는다", dmg: 2, weight: 2 },
          ],
        },
        baseDmg: 5,
        bonus: (G) => (G.flag("wolf_ready") ? 18 : 6),
        allowFlee: true,
        onWin: {
          effect: (G) => { G.setFlag("wolves_won"); G.mod("reputation", 6); G.mod("awareness", 3); G.mod("health", 4); },
          outcome: { type: "good", text: "두목이 목을 꿰뚫린 채 쓰러지자, 나머지는 꼬리를 말고 흩어진다. 따라붙던 도적들도 그 광경을 보고 물러났다. 길목이 정리됐다." },
          next: "p2_wolves_after",
        },
        onLose: {
          effect: (G) => { G.setFlag("wolves_fled"); G.mod("reputation", 1); },
          outcome: { type: "neutral", text: "당신은 무리해서 싸우지 않았다. 횃불을 휘두르며 천천히 물러나, 좁은 바위틈으로 빠진다. 늑대는 좁은 길을 싫어한다. 토벌은 못 했지만, 살아 돌아왔다." },
          next: "p2_wolves_after",
        },
      },
    },

    p2_wolves_after: {
      title: "돌아온 순찰대",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -4); },
      text: (G) => {
        const arr = [];
        if (G.flag("wolves_won")) {
          arr.push({ t: "narr", c: "당신은 늑대 두목의 가죽을 끌고 성채로 돌아온다. 가렌이 휘파람을 분다." });
          arr.push({ t: "speak", c: "가렌: “창 하나로 무리 두목을 잡아? …진흙골 놈, 오래 살겠다.”" });
        } else {
          arr.push({ t: "narr", c: "토벌은 다음으로 미뤄졌지만, 당신은 한 명도 잃지 않고 순찰대를 데려왔다. 변경에선 그것만으로도 드문 일이다." });
        }
        arr.push({ t: "narr", c: "그날 밤, 성채에 급보가 든다. 남작이 직접 호송대를 이끌고 자작령으로 향해야 한다 — 그리고 호송로에는 이미 매복의 그림자가 깔려 있다." });
        return arr;
      },
      choices: [
        { text: "호송대에 편성된다.", continue: true, next: "p2_escort" },
      ],
    },

    p2_escort: {
      title: "호송대",
      location: "하윈 영지 · 호송로",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -5); },
      text: [
        { t: "narr", c: "좁은 골짜기 길. 남작과 기사들이 선두에, 보급마차가 후미에, 병졸들이 양옆을 따른다. 청연의 감각이 비명을 지른다 — 능선 위, 까마귀가 한 마리도 없다. 새가 없는 골짜기는, 이미 사람이 숨어 있다는 뜻이다." },
        { t: "danger", c: "“매복이다!” 외침과 동시에 화살이 쏟아진다. 도적과 탈영병의 무리. 기사들은 남작을 둘러싸고, 대열이 무너진다." },
        { t: "think", c: "모두가 남작에게 달려간다. 귀족 하나를 지키려고. …하지만 적이 진짜 노리는 건 뭐지? 사람을 죽이러 온 게 아니다. 굶주린 놈들이다. 놈들이 원하는 건—" },
      ],
      choices: [
        {
          text: "기사들을 따라 남작을 호위한다. (명예로운 선택)",
          effect: (G) => { G.mod("health", -10); G.setFlag("guarded_noble"); G.mod("reputation", -1); },
          outcome: { type: "bad", text: "당신은 남작 곁에서 용감히 싸운다. 남작은 무사하다. 하지만 후미의 보급마차가 통째로 약탈당하고, 후퇴로가 끊긴다. 식량과 화살을 잃은 호송대는, 자작령까지 굶주린 채 기어가야 한다." },
          next: "p2_escort_resolve",
        },
        {
          text: "보급마차와 후퇴로를 먼저 지킨다. (거지의 선택)",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: 25 },
          onSuccess: {
            effect: (G) => { G.setFlag("saved_supply"); G.mod("reputation", 10); G.mod("awareness", 4); G.mod("health", -6); },
            outcome: { type: "good", text: "“마차 지켜! 굶으면 다 죽는다!” 당신은 병졸 몇을 끌고 후미로 달려, 좁은 길목에 마차를 세워 방벽으로 삼는다. 적의 진짜 목표였던 식량을 지켜냈고, 끊길 뻔한 후퇴로를 확보했다. 처음엔 비겁하다 욕먹었지만 — 호송대 전체가 살아 돌아왔다." },
            next: "p2_escort_resolve",
          },
          onFail: {
            effect: (G) => { G.mod("health", -14); G.setFlag("saved_supply"); G.mod("reputation", 5); },
            outcome: { type: "bad", text: "당신은 후미로 달렸다. 마차 절반은 지켰지만, 적의 둔기에 어깨를 내줬다. 그래도 후퇴로는 열어뒀다. 굶주린 채로나마, 호송대는 길을 빠져나간다." },
            next: "p2_escort_resolve",
          },
        },
      ],
    },

    p2_escort_resolve: {
      title: "쓸모 있는 병사",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", 8); G.addRation(2); G.mod("health", 8); },
      text: (G) => {
        const arr = [{ t: "narr", c: "자작령 성문이 보인다. 그을리고 피곤한 호송대가, 그래도 살아서 도착했다." }];
        if (G.flag("saved_supply")) {
          arr.push({ t: "narr", c: "남작 에드릭 하윈이 말에서 내려, 당신 앞에 선다. 그의 인정은 따뜻하지 않다. 그래서 더 무겁다." });
          arr.push({ t: "speak", c: "하윈: “모두가 내게 달려올 때, 너는 마차로 달렸다. …비겁하다 욕하는 자도 있겠지. 하지만 네 덕에 한 명도 굶겨 죽이지 않았다.”" });
          arr.push({ t: "speak", c: "하윈: “너는 명예로운 병사는 아니다. 하지만 쓸모 있는 병사다.”" });
          arr.push({ t: "think", c: "칭찬보다 큰 보상이었다. 명예는 배를 채워주지 않지만, '쓸모'는 다음 겨울을 보장한다." });
        } else {
          arr.push({ t: "narr", c: "남작은 무사했지만, 잃은 보급이 호송대를 굶주리게 했다. 그래도 당신은 끝까지 자리를 지켰다." });
          arr.push({ t: "speak", c: "하윈: “용감했다. 다만 다음엔, 칼이 향하는 곳 말고 적이 원하는 것을 봐라. 너는 그게 보이는 놈 같으니까.”" });
        }
        return arr;
      },
      choices: [
        { text: "남작의 말을 새긴다.", effect: (G) => { G.setStatus("정규 무장병"); G.mod("reputation", 3); }, continue: true, next: "p2_epilogue" },
      ],
    },

    p2_epilogue: {
      title: "— 2페이즈 종료 —",
      submit: { result: "2페이즈 클리어" },
      text: (G) => [
        { t: "sys", c: "【 1부 2페이즈 「남작의 개」 클리어 】" },
        { t: "narr", c: "촌놈 병사 로완은, 이제 남작이 이름을 기억하는 정규 무장병이 되었다. 기사처럼 싸워서가 아니다. 보급을 보고, 후퇴로를 보고, 낮은 사람들의 말에서 전장을 읽었기 때문이다." },
        { t: "sys", c: "평판 " + G.s.stats.reputation + " · 눈치 " + G.s.stats.awareness + " · 생존 " + G.s.day + "일" },
        { t: "think", c: "다음은 자작의 군영이다. 더 큰 군대, 더 많은 깃발. 그리고 그곳에서 나는 처음으로… 남을 지휘하게 된다." },
      ],
      choices: [
        { text: "자작의 군영으로 향한다. (3페이즈 →)", continue: true, next: "p3_intro" },
        { text: "타이틀로 돌아간다.", action: "title" },
      ],
    },

    /* =====================================================
       1부 3페이즈 「열 명의 목숨」 — 석피 멧돼지 + 분대 지휘
       ===================================================== */
    p3_intro: {
      title: "열 명의 목숨",
      phase: "1부 3페이즈",
      location: "칼덴 군영",
      status: "자작 근위대 대원",
      onEnter: (G) => { G.nextDay(); G.mod("hunger", -6); },
      text: [
        { t: "sys", c: "【 1부 3페이즈 「열 명의 목숨」 】" },
        { t: "narr", c: "칼덴 자작의 군영은 하윈 성채와 격이 다르다. 깃발, 장교, 명령 체계, 수백의 병사. 진짜 전쟁의 냄새가 난다." },
        { t: "narr", c: "자작 알브레히트 칼덴은 50대의 전략가다. 그는 로완을 아끼지 않는다 — 관찰한다." },
        { t: "speak", c: "칼덴: “천한 놈이 이상하게 오래 살아남는군. 왕국은 점잖은 기사보다, 네놈 같은 더러운 생존자를 필요로 하게 될 것이다.”" },
        { t: "narr", c: "그때, 군영 외곽에서 비명이 터진다. 척후를 나간 십인조가 무언가에 쫓겨 돌아온다 — 그 뒤로, 땅을 울리며 거대한 그림자가 따라온다." },
        { t: "danger", c: "석피 멧돼지. 돌처럼 굳은 가죽의 3등급 중형 마물. 십장이 창을 들고 막아서지만, 정면으로는 막을 수 없다." },
      ],
      choices: [
        {
          text: "정면에 서지 말라고 외치며, 측면으로 파고들 자리를 잡는다.",
          tag: "눈치 판정", tagType: "info",
          check: { stat: "awareness", bonus: 25 },
          onSuccess: {
            effect: (G) => { G.setFlag("boar_ready"); G.mod("awareness", 2); },
            outcome: { type: "good", text: "“정면 비켜! 돌진은 직선이다!” 당신은 바위 사이로 몸을 숨기며, 멧돼지가 선회하는 사각을 미리 읽는다. 청연의 보법이 살아난다. (전투에서 회피 보너스)" },
            next: "p3_boar",
          },
          onFail: {
            outcome: { type: "neutral", text: "외칠 새도 없이 멧돼지가 들이닥친다. 흙먼지 속에서, 정신없이 맞서야 한다." },
            next: "p3_boar",
          },
        },
      ],
    },

    p3_boar: {
      combat: {
        enemy: {
          name: "석피 멧돼지",
          grade: "3등급 중형",
          maxHp: 42,
          weakness: "드러난 복부",
          intro: [
            { t: "danger", c: "성인 수소만 한 몸집. 돌 같은 가죽은 창을 튕겨낸다. 약점은 단 하나, 돌진 뒤 숨을 고를 때 드러나는 무른 복부." },
            { t: "think", c: "정면은 죽음이다. 돌진을 흘리고, 놈이 숨을 고를 때 복부를 노린다. 그게 유일한 길이다." },
          ],
          moves: [
            { type: "heavy", name: "돌진", tell: "석피 멧돼지가 땅을 박찬다 — 돌진!", dmg: 20, weight: 3 },
            { type: "light", name: "머리 휘두르기", dmg: 8, weight: 2 },
            { type: "guarded", name: "거친 숨을 고른다 (복부가 드러난다)", dmg: 1, weight: 2 },
          ],
        },
        baseDmg: 6,
        bonus: (G) => (G.flag("boar_ready") ? 20 : 8),
        allowFlee: true,
        onWin: {
          effect: (G) => { G.setFlag("boar_won"); G.mod("reputation", 10); G.mod("awareness", 4); },
          outcome: { type: "good", text: "벌려둔 틈으로 창이 복부 깊숙이 박힌다. 거대한 몸이 흙먼지를 일으키며 무너진다. 군영의 병사들이 입을 다물지 못한다 — 진흙골 출신이, 창 한 자루로 3등급 마물을 잡았다." },
          next: "p3_boar_after",
        },
        onLose: {
          effect: (G) => { G.setFlag("boar_fled"); G.mod("reputation", 2); },
          outcome: { type: "neutral", text: "당신은 멧돼지를 죽이진 못했지만, 측면으로 유인해 군영에서 떼어냈다. 그사이 십장과 병사들이 함정으로 몰아 마무리한다. 살아남았고, 한 명도 잃지 않았다." },
          next: "p3_boar_after",
        },
      },
    },

    p3_boar_after: {
      title: "십장의 죽음",
      onEnter: (G) => { G.mod("health", 6); },
      text: [
        { t: "narr", c: "마물은 정리됐다. 하지만 안도할 틈이 없다. 멧돼지를 쫓아낸 자리로, 진짜 위협이 모습을 드러낸다 — 피난민을 약탈하던 도적 무리와, 그들을 뒤따라온 또 다른 마물 떼가 동시에 군영 측면으로 몰려든다." },
        { t: "danger", c: "혼전 속, 십인조의 십장이 화살에 목을 꿰뚫려 쓰러진다. 지휘를 잃은 열 명의 병사가 패닉에 빠진다. 도망치려는 자, 얼어붙은 자, 우는 자." },
        { t: "think", c: "…아무도 저들을 묶지 않으면, 다 죽는다. 이름 없는 병졸일 땐, 내 목숨만 챙기면 됐다. 그런데 지금—" },
        { t: "speak", c: "요나: “로완! 다들 무너진다! 누가… 누가 좀 잡아줘야 해!”" },
      ],
      choices: [
        {
          text: "흩어지는 병사들을 억지로 묶는다. 멋있을 필요 없다. 살리면 된다.",
          effect: (G) => { G.setStatus("임시 십장"); G.mod("reputation", 3); },
          outcome: { type: "neutral", text: "“울 시간 있으면 진흙 발라! 창 버리는 놈은 내가 먼저 죽인다! 살고 싶으면 내 목소리만 따라와!” 낭만 없는 호령. 그래서 더 먹힌다. 흩어지던 열 명이, 한 점으로 모인다." },
          next: "p3_command",
        },
      ],
    },

    p3_command: {
      command: {
        intro: [
          { t: "danger", c: "도적과 마물이 동시에 측면을 두드린다. 당신의 등에, 처음으로 열 명의 목숨이 매달렸다." },
          { t: "think", c: "자작 본대가 정렬해 도착할 때까지. 그때까지만 버티면 된다. 한 명이라도 더 데리고." },
        ],
        squad: 10,
        morale: 55,
        waves: [
          { threat: 3, desc: [{ t: "narr", c: "제1파. 도적 선발대가 함성을 지르며 달려든다. 아직은 떠보는 공격이다." }] },
          { threat: 4, desc: [{ t: "narr", c: "제2파. 측면 풀숲에서 잿빛 늑대 몇 마리가 병사들의 옆구리를 노린다. 전열이 술렁인다." }] },
          { threat: 4, desc: [{ t: "narr", c: "제3파. 도적 본대가 밀고 들어온다. 머릿수에 겁먹은 병사들의 사기가 시험대에 오른다." }] },
          { threat: 5, desc: [{ t: "danger", c: "제4파. 비늘몸 한 마리가 난입해 난전이 벌어진다. 비명과 피. 여기서 무너지면 끝이다." }] },
          { threat: 6, desc: [{ t: "danger", c: "최후의 파도. 멀리 자작의 뿔나팔이 울린다 — 증원이 온다! 그때까지, 이 한 번만 더 버텨라!" }] },
        ],
        onComplete: (G, r) => {
          G.s.cmdResult = r;
          if (r.result === "held") {
            G.mod("reputation", r.survivors >= 7 ? 16 : 10);
            G.mod("awareness", 3);
          } else {
            G.mod("reputation", 4);
          }
          return "p3_command_after";
        },
      },
    },

    p3_command_after: {
      title: "등에 매달린 무게",
      onEnter: (G) => { G.mod("hunger", 6); G.addRation(2); G.mod("health", 6); },
      text: (G) => {
        const r = G.s.cmdResult || { survivors: 0, maxSquad: 10, casualties: 0, result: "held" };
        const arr = [];
        if (r.result === "held") {
          arr.push({ t: "narr", c: "자작의 본대가 측면을 휩쓸자, 도적과 마물이 썰물처럼 빠진다. 당신의 분대는 — 무너지지 않았다." });
        } else {
          arr.push({ t: "narr", c: "전선은 결국 밀렸다. 자작의 본대에 떠밀려 후퇴하는 길, 당신은 남은 자들을 끌고 빠져나온다." });
        }
        arr.push({ t: "sys", c: "분대 생존 " + r.survivors + "/" + r.maxSquad + " · 전사 " + r.casualties + "명" });
        if (r.casualties > 0) {
          arr.push({ t: "narr", c: "그러나 " + r.casualties + "개의 빈자리가 있다. 어제까지 같은 솥의 죽을 먹던 얼굴들. 당신의 명령 한 마디에 살고 죽은 자들." });
          arr.push({ t: "think", c: "이름 없는 병졸일 때는, 죽어도 내 죽음 하나였다. 십장이 되자, 남의 죽음이 내 등에 쌓인다. 이게… 지휘구나." });
        } else {
          arr.push({ t: "narr", c: "믿기지 않게도, 한 명도 잃지 않았다. 병사들이 당신을 보는 눈이 달라졌다. 두려움과, 신뢰가 섞인 눈." });
        }
        if (r.survivors > 0) {
          arr.push({ t: "speak", c: "헬가 같은 거구의 피난민 병사가 다가온다: “도망치라면 도망치고, 버티라면 버텼다. 이유를 제대로 말해준 지휘관은 네가 처음이다.”" });
        }
        return arr;
      },
      choices: [
        { text: "쓰러진 자들의 이름을 장부에서 확인한다.", continue: true, next: "p3_end" },
      ],
    },

    p3_end: {
      title: "축복이자 저주",
      onEnter: (G) => { G.setStatus("자작 근위대 십장"); G.mod("reputation", 4); },
      text: [
        { t: "narr", c: "자작 알브레히트 칼덴이 당신을 부른다. 그의 눈은 당신을 칭찬하는 게 아니라, 저울에 다는 듯하다." },
        { t: "speak", c: "칼덴: “십장이 죽은 자리에서, 네가 열 명을 묶었다. 정식으로 임명한다. 너는 이제 칼덴 근위대의 십장이다.”" },
        { t: "narr", c: "병사들이 부러운 눈으로 본다. 승진이다. 출세다. 하지만 로완은 안다 — 이건 축복이 아니라, 저주에 가깝다." },
        { t: "think", c: "이름 없는 병졸일 때는 자기 목숨만 챙기면 됐다. 십장이 된 뒤로는, 열 명의 목숨이 그의 등에 매달렸다." },
      ],
      choices: [
        { text: "십장의 표식을 받는다.", effect: (G) => { G.give("ledger"); }, continue: true, next: "p3_epilogue" },
      ],
    },

    p3_epilogue: {
      title: "— 1부 완결 —",
      submit: { result: "1부 완결" },
      text: (G) => {
        const r = G.s.cmdResult || { survivors: 0, maxSquad: 10, casualties: 0 };
        const arr = [
          { t: "sys", c: "【 1부: 빵 한 덩이와 창 한 자루 — 완결 】" },
          { t: "narr", c: "진흙골의 무적자였던 아이는, 이제 자작 근위대의 십장이 되었다. 강해서 올라온 길이 아니다. 매번 세계가 무너지는 틈에서, '죽을 자리를 먼저 보는 놈'이 되었기에 올라왔다." },
          { t: "sys", c: "최종 평판 " + G.s.stats.reputation + " · 눈치 " + G.s.stats.awareness + " · 생존 " + G.s.day + "일" },
        ];
        if (G.flag("boar_won")) arr.push({ t: "sys", c: "기록: 창 한 자루로 3등급 마물 석피 멧돼지를 잡았다." });
        arr.push({ t: "sys", c: "기록: 첫 지휘에서 " + r.survivors + "/" + r.maxSquad + "을 살려냈다." });
        arr.push({ t: "narr", c: "1부의 마지막 정서는 이것이다 — 빵 한 덩이를 위해 머리를 조아리던 아이가, 이제 열 명의 빵을 책임진다. 무게는 늘었고, 굶주림은 끝나지 않았다." });
        arr.push({ t: "think", c: "다음 겨울, 자작은 정치적 이유로 패전의 책임을 뒤집어쓸 것이다. 그리고 버려진 병사들 사이에서, 나는 또 다른 무언가가 되어야 할 것이다. …하지만 그건, 2부의 이야기다." });
        arr.push({ t: "sys", c: "▶ 2부 「거지 남작」 — 깨진방패단의 이야기는 다음 장에서 이어집니다. (현재 1부 전체 플레이 가능)" });
        return arr;
      },
      choices: [
        { text: "여기까지의 여정을 되새긴다. (타이틀로)", action: "title" },
        { text: "처음부터 다시 시작한다.", action: "restart" },
      ],
    },

    /* ---------- 게임 오버 ---------- */
    game_over: {
      title: "진흙으로 돌아가다",
      text: [
        { t: "danger", c: "눈앞이 어두워진다." },
        { t: "narr", c: "청연으로 한 번, 로완으로 또 한 번. 두 번째 삶도 진흙 속에서 식어간다. 장부에 적히지 못한 이름은, 아무도 기억하지 않는다." },
        { t: "think", c: "…그래도, 끝까지 굶지는 않았다. 그거면… 됐나." },
        { t: "sys", c: "당신은 죽었다. 이 세계에서 죽음은 흔하다. 흔하기에, 살아남는 것이 모든 것이다." },
      ],
      choices: [
        { text: "다시 시작한다.", action: "restart" },
      ],
    },
  },
};
