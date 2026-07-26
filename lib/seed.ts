import type { Data } from "./types";

// Ported from the Claude Design prototype (The Trinidad Diaries.dc.html).
export const SEED_DATA: Data = {
  heroImageUrl: null, // filled in by lib/store.ts on first read (public/seed/hero-chaconia.png)
  sessions: [
    {
      id: "s5",
      n: "05",
      date: "21. Trockenmond",
      place: "La Brea",
      hue: "gold",
      title: "Die Pechsee",
      recap: "Der See atmet. Was er verschluckt, gibt er nach hundert Jahren zurück — und die Runde konnte nicht entscheiden, ob sie hundert Jahre zu spät kam oder genau richtig.",
      tags: ["Dungeon", "Boss: Der Teermann", "Fund: Ascheperle"],
    },
    {
      id: "s4",
      n: "04",
      date: "09. Trockenmond",
      place: "Port-of-Iere",
      hue: "teal",
      title: "J'ouvert im Nebel",
      recap: "Vor dem Morgengrauen, Schlamm bis zu den Knien, Masken überall. In der tanzenden Menge trug jemand euer Gesicht — und tanzte, ehrlich gesagt, besser als ihr.",
      tags: ["Fest", "Verrat?", "Neu: Der Doppelgänger"],
    },
    {
      id: "s3",
      n: "03",
      date: "02. Trockenmond",
      place: "Caroni-Sümpfe",
      hue: "red",
      title: "Der Scharlachrote Ibis",
      recap: "Ein Schwarm scharlachroter Ibisse führte die Gruppe tiefer in die Mangroven, als jede Karte reicht. Am Ende des Wassers stand eine Tür — ohne Wand darum herum.",
      tags: ["Omen", "Kampf: Caiman", "Rätsel gelöst"],
    },
    {
      id: "s2",
      n: "02",
      date: "19. Regenmond",
      place: "Laventille · Oberstadt",
      hue: "gold",
      title: "Der Stahltrommler",
      recap: "Ein blinder Panist spielte eine Melodie, die niemand ihm beigebracht hat. Wer zuhörte, erinnerte sich plötzlich an Dinge, die noch gar nicht geschehen sind.",
      tags: ["Neu: Papa Bois", "Steelpan-Magie"],
    },
    {
      id: "s1",
      n: "01",
      date: "12. Regenmond",
      place: "Hafen von Chaguval",
      hue: "red",
      title: "Ankunft in Chaguval",
      recap: "Die Fähre legte bei Sonnenuntergang an. Trommeln aus der Altstadt, der Duft von Doubles am Kai — und ein Fremder, der die ganze Runde beim Namen kannte.",
      tags: ["Session Zero", "Neu: Mama Glo", "Fund: Messingpfeife"],
    },
  ],
  party: [
    { id: "p1", name: "Anansi K’free", role: "Trickster-Barde", hue: "gold", initial: "A" },
    { id: "p2", name: "Soucouya", role: "Feuerhexe", hue: "red", initial: "S" },
    { id: "p3", name: "Douen", role: "Schattenläufer", hue: "teal", initial: "D" },
    { id: "p4", name: "Lagahoo", role: "Wächter der Runde", hue: "ink", initial: "L" },
  ],
  zitate: [
    { id: "q1", text: "Wenn der Plan gut ist, hat ihn nicht die Runde gemacht.", who: "Douen", session: "Sitzung 04", hue: "gold" },
    { id: "q2", text: "Ich würfle nicht gegen den Nebel. Der Nebel würfelt gegen mich.", who: "Soucouya", session: "Sitzung 03", hue: "red" },
    { id: "q3", text: "Papa Bois hat gesagt, ich soll geradeaus gehen. Papa Bois lügt.", who: "Anansi K’free", session: "Sitzung 02", hue: "teal" },
    { id: "q4", text: "Das war KEIN Kolibri.", who: "Lagahoo", session: "Sitzung 03", hue: "gold" },
    { id: "q5", text: "Doubles zuerst. Heldentum danach.", who: "Anansi K’free", session: "Sitzung 01", hue: "red" },
    { id: "q6", text: "Ihr seid hundert Jahre zu früh — oder ich hundert zu spät.", who: "Der Teermann", session: "Sitzung 05", hue: "teal" },
  ],
  snippets: [
    { id: "sn1", cat: "Hausregel", hue: "gold", title: "Steelpan-Magie", body: "Wer eine Melodie auf dem Pan spielt, darf einmal pro Szene ein Vorzeichen umdeuten." },
    { id: "sn2", cat: "Ort", hue: "teal", title: "Die Caroni-Sümpfe", body: "Bei Sonnenuntergang färben zehntausend Ibisse die Mangroven scharlachrot. Navigation nur bei Ebbe." },
    { id: "sn3", cat: "Regel", hue: "red", title: "Zustand: Nebel", body: "Solange „Nebel\" aktiv ist, kostet jede Bewegung 1 Rüstung — oder eine wahre Erinnerung." },
    { id: "sn4", cat: "Fund", hue: "gold", title: "Die Messingpfeife", body: "Einmal geblasen ruft sie, was in der Nähe verloren ging. Auch Menschen." },
    { id: "sn5", cat: "Fraktion", hue: "teal", title: "Die Maskenzunft", body: "Bei J’ouvert regieren sie die Straßen. Niemand kennt ihre Gesichter, alle kennen ihre Regeln." },
    { id: "sn6", cat: "NSC-Notiz", hue: "red", title: "Mama Glo", body: "Spricht nur in Rätseln über Wasser. Kennt jeden Namen, den ihr noch nicht gewählt habt." },
  ],
  npcs: [
    { id: "npc-mamaglo", name: "Mama Glo", faction: "Hüterin der Flüsse", hue: "teal", desc: "Halb Frau, halb Aal. Handelt in Namen und Geheimnissen.", status: "Verbündet", portraitUrl: null },
    { id: "npc-papabois", name: "Papa Bois", faction: "Wächter des Waldes", hue: "gold", desc: "Alter Hirte der Tiere. Prüft, bevor er hilft.", status: "Neutral", portraitUrl: null },
    { id: "npc-teermann", name: "Der Teermann", faction: "Der Pechsee", hue: "red", desc: "Was der See verschluckt, trägt er als Gesicht.", status: "Feind", portraitUrl: null },
    { id: "npc-doppelgaenger", name: "Der Doppelgänger", faction: "J’ouvert-Menge", hue: "gold", desc: "Trägt euer Gesicht — und tanzt es besser.", status: "Unbekannt", portraitUrl: null },
    { id: "npc-panist", name: "Der blinde Panist", faction: "Laventille", hue: "teal", desc: "Spielt Melodien aus der Zukunft. Verlangt Erinnerungen als Lohn.", status: "Verbündet", portraitUrl: null },
    { id: "npc-soucouyant", name: "Soucouyant-Älteste", faction: "Die Nachtfeuer", hue: "red", desc: "Streift nachts als Feuerball. Zählt eure Atemzüge.", status: "Feind", portraitUrl: null },
  ],
  pcs: [
    {
      id: "pc-anansi", name: "Anansi K’free", playbook: "Der Barde", hue: "gold",
      backstory: "Erzähler aus Port-of-Iere, der seine Schulden mit Geschichten begleicht. Seine Lügen werden zu oft wahr — inzwischen weiß er selbst nicht mehr, welche.",
      portraitUrl: null,
      npcs: [
        { id: "pc-anansi-npc-0", name: "Mama Glo", rel: "Gläubigerin", avatarUrl: null },
        { id: "pc-anansi-npc-1", name: "Der blinde Panist", rel: "Alter Lehrer", avatarUrl: null },
      ],
    },
    {
      id: "pc-soucouya", name: "Soucouya", playbook: "Die Hexe", hue: "red",
      backstory: "Trägt das geerbte Nachtfeuer der Soucouyant in sich und hält es mit Mühe im Zaum. Sucht ein Ritual, das die Flamme bindet, ohne sie zu töten.",
      portraitUrl: null,
      npcs: [
        { id: "pc-soucouya-npc-0", name: "Soucouyant-Älteste", rel: "Blutlinie", avatarUrl: null },
        { id: "pc-soucouya-npc-1", name: "Papa Bois", rel: "Widerwilliger Mentor", avatarUrl: null },
      ],
    },
    {
      id: "pc-douen", name: "Douen", playbook: "Der Spähter", hue: "teal",
      backstory: "Kind ohne Gesicht, mit verkehrt herum stehenden Füßen. Findet jeden Pfad, erinnert sich aber an keinen Namen — auch nicht den eigenen.",
      portraitUrl: null,
      npcs: [
        { id: "pc-douen-npc-0", name: "Papa Bois", rel: "Beschützer", avatarUrl: null },
        { id: "pc-douen-npc-1", name: "Der Doppelgänger", rel: "Spiegelbild?", avatarUrl: null },
      ],
    },
    {
      id: "pc-lagahoo", name: "Lagahoo", playbook: "Der Wächter", hue: "ink",
      backstory: "Bei Tag ein sanfter Mann, bei Vollmond Ketten und Sarg. Hat der Runde einen Eid geschworen, den er selbst nicht ganz versteht.",
      portraitUrl: null,
      npcs: [
        { id: "pc-lagahoo-npc-0", name: "Der Teermann", rel: "Alte Schuld", avatarUrl: null },
        { id: "pc-lagahoo-npc-1", name: "Mama Glo", rel: "Zeugin des Eids", avatarUrl: null },
      ],
    },
  ],
  moods: [
    { id: "mood-1", caption: "J’ouvert · Morgengrauen", span: "span2row2", imageUrl: null },
    { id: "mood-2", caption: "Steelpan-Yard", span: "", imageUrl: null },
    { id: "mood-3", caption: "Caroni bei Ebbe", span: "", imageUrl: null },
    { id: "mood-4", caption: "Scharlachroter Ibis", span: "row2", imageUrl: null },
    { id: "mood-5", caption: "Pechsee, La Brea", span: "", imageUrl: null },
    { id: "mood-6", caption: "Masken der Zunft", span: "", imageUrl: null },
    { id: "mood-7", caption: "Doubles am Kai", span: "span2", imageUrl: null },
  ],
  quoteOfWeek: {
    text: "Wer den Kolibri sehen will, muss aufhören, nach ihm zu greifen.",
    who: "Mama Glo · Sitzung 01",
  },
};
