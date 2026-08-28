import { describe, expect, it } from "vitest";

import section01Activities from "@/data/activities/section-01.json";
import section02Activities from "@/data/activities/section-02.json";
import section03Activities from "@/data/activities/section-03.json";
import section04Activities from "@/data/activities/section-04.json";
import section05Activities from "@/data/activities/section-05.json";
import section06Activities from "@/data/activities/section-06.json";
import section07Activities from "@/data/activities/section-07.json";
import section08Activities from "@/data/activities/section-08.json";
import section09Activities from "@/data/activities/section-09.json";
import section10Activities from "@/data/activities/section-10.json";
import section11Activities from "@/data/activities/section-11.json";
import section12Activities from "@/data/activities/section-12.json";
import section13Activities from "@/data/activities/section-13.json";
import section14Activities from "@/data/activities/section-14.json";
import section01Learn from "@/data/learn/section-01.learn.json";
import section02Learn from "@/data/learn/section-02.learn.json";
import section03Learn from "@/data/learn/section-03.learn.json";
import section04Learn from "@/data/learn/section-04.learn.json";
import section05Learn from "@/data/learn/section-05.learn.json";
import section06Learn from "@/data/learn/section-06.learn.json";
import section07Learn from "@/data/learn/section-07.learn.json";
import section08Learn from "@/data/learn/section-08.learn.json";
import section09Learn from "@/data/learn/section-09.learn.json";
import section10Learn from "@/data/learn/section-10.learn.json";
import section11Learn from "@/data/learn/section-11.learn.json";
import section12Learn from "@/data/learn/section-12.learn.json";
import section13Learn from "@/data/learn/section-13.learn.json";
import section14Learn from "@/data/learn/section-14.learn.json";
import section01QuickViews from "@/data/quick/section-01.quick.json";
import section02QuickViews from "@/data/quick/section-02.quick.json";
import section03QuickViews from "@/data/quick/section-03.quick.json";
import section04QuickViews from "@/data/quick/section-04.quick.json";
import section05QuickViews from "@/data/quick/section-05.quick.json";
import section06QuickViews from "@/data/quick/section-06.quick.json";
import section07QuickViews from "@/data/quick/section-07.quick.json";
import section08QuickViews from "@/data/quick/section-08.quick.json";
import section09QuickViews from "@/data/quick/section-09.quick.json";
import section10QuickViews from "@/data/quick/section-10.quick.json";
import section11QuickViews from "@/data/quick/section-11.quick.json";
import section12QuickViews from "@/data/quick/section-12.quick.json";
import section13QuickViews from "@/data/quick/section-13.quick.json";
import section14QuickViews from "@/data/quick/section-14.quick.json";
import sections from "@/data/sections/sections.json";
import generalQcProcesses from "@/data/generalQc/general-qc-processes.json";
import universalFieldReference from "@/data/generalQc/universal-field-reference.json";

const system01Ids = ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7"];
const system02Ids = [
  "2.1",
  "2.2",
  "2.3",
  "2.4",
  "2.5",
  "2.6",
  "2.7",
  "2.8",
  "2.9",
  "2.10",
  "2.11",
  "2.12"
];
const system03Ids = ["3.1", "3.2", "3.3", "3.4", "3.5", "3.6", "3.7", "3.8"];
const system04Ids = [
  "4.1",
  "4.2",
  "4.3",
  "4.4",
  "4.5",
  "4.6",
  "4.7",
  "4.8",
  "4.9",
  "4.10"
];
const system05Ids = [
  "5.1",
  "5.2",
  "5.3",
  "5.4",
  "5.5",
  "5.6",
  "5.7",
  "5.8",
  "5.9"
];
const system06Ids = [
  "6.1",
  "6.2",
  "6.3",
  "6.4",
  "6.5",
  "6.6",
  "6.7",
  "6.8",
  "6.9"
];
const system07Ids = ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7"];
const system08Ids = [
  "8.1",
  "8.2",
  "8.3",
  "8.4",
  "8.5",
  "8.6",
  "8.7",
  "8.8",
  "8.9",
  "8.10",
  "8.11"
];
const system09Ids = [
  "9.1",
  "9.2",
  "9.3",
  "9.4",
  "9.5",
  "9.6",
  "9.7",
  "9.8",
  "9.9",
  "9.10",
  "9.11"
];
const system10Ids = [
  "10.1",
  "10.2",
  "10.3",
  "10.4",
  "10.5",
  "10.6",
  "10.7",
  "10.8"
];
const system11Ids = [
  "11.1",
  "11.2",
  "11.3",
  "11.4",
  "11.5",
  "11.6",
  "11.7",
  "11.8",
  "11.9",
  "11.10",
  "11.11"
];
const system12Ids = [
  "12.1",
  "12.2",
  "12.3",
  "12.4",
  "12.5",
  "12.6",
  "12.7",
  "12.8",
  "12.9",
  "12.10"
];
const system13Ids = [
  "13.1",
  "13.2",
  "13.3",
  "13.4",
  "13.5",
  "13.6",
  "13.7",
  "13.8",
  "13.9",
  "13.10",
  "13.11"
];
const system14Ids = [
  "14.1",
  "14.2",
  "14.3",
  "14.4",
  "14.5",
  "14.6",
  "14.7",
  "14.8",
  "14.9",
  "14.10",
  "14.11",
  "14.12",
  "14.13",
  "14.14",
  "14.15"
];

const textValues = (blocks: readonly unknown[]) =>
  blocks.flatMap((block) => {
    if (!block || typeof block !== "object") return [];
    const candidate = block as { item?: unknown; items?: unknown[] };
    const items = candidate.items ?? (candidate.item ? [candidate.item] : []);
    return items.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const text = (item as { text?: { fr?: string } }).text?.fr;
      return text ? [text] : [];
    });
  });

describe("revised French content repopulation", () => {
  it("keeps the expected canonical records for the three revised sources", () => {
    expect(generalQcProcesses).toHaveLength(16);
    expect(section01Activities.map((activity) => activity.id)).toEqual(
      system01Ids
    );
    expect(section02Activities.map((activity) => activity.id)).toEqual(
      system02Ids
    );
    expect(section01QuickViews).toHaveLength(7);
    expect(section02QuickViews).toHaveLength(12);
    expect(section01Learn).toHaveLength(7);
    expect(section02Learn).toHaveLength(12);
    expect(new Set([...system01Ids, ...system02Ids]).size).toBe(19);
  });

  it("keeps the expected canonical records for revised Systems 03, 04, and 05", () => {
    expect(section03Activities.map((activity) => activity.id)).toEqual(
      system03Ids
    );
    expect(section04Activities.map((activity) => activity.id)).toEqual(
      system04Ids
    );
    expect(section05Activities.map((activity) => activity.id)).toEqual(
      system05Ids
    );
    expect(section03QuickViews).toHaveLength(8);
    expect(section04QuickViews).toHaveLength(10);
    expect(section05QuickViews).toHaveLength(9);
    expect(section03Learn).toHaveLength(8);
    expect(section04Learn).toHaveLength(10);
    expect(section05Learn).toHaveLength(9);
    expect(new Set([...system03Ids, ...system04Ids, ...system05Ids]).size).toBe(
      27
    );
  });

  it("keeps the expected canonical records for revised Systems 06, 07, and 08", () => {
    expect(section06Activities.map((activity) => activity.id)).toEqual(
      system06Ids
    );
    expect(section07Activities.map((activity) => activity.id)).toEqual(
      system07Ids
    );
    expect(section08Activities.map((activity) => activity.id)).toEqual(
      system08Ids
    );
    expect(section06QuickViews).toHaveLength(9);
    expect(section07QuickViews).toHaveLength(7);
    expect(section08QuickViews).toHaveLength(11);
    expect(section06Learn).toHaveLength(9);
    expect(section07Learn).toHaveLength(7);
    expect(section08Learn).toHaveLength(11);
    expect(new Set([...system06Ids, ...system07Ids, ...system08Ids]).size).toBe(
      27
    );
  });

  it("keeps the expected canonical records for revised Systems 09, 10, and 11", () => {
    expect(section09Activities.map((activity) => activity.id)).toEqual(
      system09Ids
    );
    expect(section10Activities.map((activity) => activity.id)).toEqual(
      system10Ids
    );
    expect(section11Activities.map((activity) => activity.id)).toEqual(
      system11Ids
    );
    expect(section09QuickViews).toHaveLength(11);
    expect(section10QuickViews).toHaveLength(8);
    expect(section11QuickViews).toHaveLength(11);
    expect(section09Learn).toHaveLength(11);
    expect(section10Learn).toHaveLength(8);
    expect(section11Learn).toHaveLength(11);
    expect(new Set([...system09Ids, ...system10Ids, ...system11Ids]).size).toBe(
      30
    );
  });

  it("keeps the expected canonical records for revised Systems 12, 13, and 14", () => {
    expect(section12Activities.map((activity) => activity.id)).toEqual(
      system12Ids
    );
    expect(section13Activities.map((activity) => activity.id)).toEqual(
      system13Ids
    );
    expect(section14Activities.map((activity) => activity.id)).toEqual(
      system14Ids
    );
    expect(section12QuickViews).toHaveLength(10);
    expect(section13QuickViews).toHaveLength(11);
    expect(section14QuickViews).toHaveLength(15);
    expect(section12Learn).toHaveLength(10);
    expect(section13Learn).toHaveLength(11);
    expect(section14Learn).toHaveLength(15);
    expect(new Set([...system12Ids, ...system13Ids, ...system14Ids]).size).toBe(
      36
    );
  });

  it("contains revised French titles and localized authored fields without changing IDs", () => {
    expect(sections.find((section) => section.id === "1")?.title.fr).toBe(
      "Travaux de site et terrassement"
    );
    expect(sections.find((section) => section.id === "2")?.title.fr).toBe(
      "Sous-structure"
    );
    expect(
      section01Activities.find((activity) => activity.id === "1.1")?.title.fr
    ).toBe("Conditions existantes");
    expect(
      section02Activities.find((activity) => activity.id === "2.1")?.title.fr
    ).toBe("Coffrage de fondation");
    expect(generalQcProcesses[0]?.title.fr).toBe(
      "Planification de l'inspection"
    );
    expect(universalFieldReference.fieldPrinciple[0]?.fr).toBe("EXIGENCE");
    expect(section01QuickViews[0]?.fieldTip?.fr).toBeTruthy();
    expect(section02Learn[0]?.whatIsThis[0]?.items[0]?.text.fr).toBeTruthy();
  });

  it("contains revised French titles for Systems 03, 04, and 05 without changing IDs", () => {
    expect(sections.find((section) => section.id === "3")?.title.fr).toBe(
      "Superstructure"
    );
    expect(sections.find((section) => section.id === "4")?.title.fr).toBe(
      "Enveloppe du bâtiment"
    );
    expect(sections.find((section) => section.id === "5")?.title.fr).toBe(
      "Toiture"
    );
    expect(
      section03Activities.find((activity) => activity.id === "3.1")?.title.fr
    ).toBe("Béton coulé en place");
    expect(
      section04Activities.find((activity) => activity.id === "4.1")?.title.fr
    ).toBe("Assemblages muraux extérieurs");
    expect(
      section05Activities.find((activity) => activity.id === "5.1")?.title.fr
    ).toBe("Pontage / Substrat de toiture");
    expect(section03QuickViews[0]?.fieldTip?.fr).toBeTruthy();
    expect(section04QuickViews[0]?.fieldTip?.fr).toBeTruthy();
    expect(section05Learn[0]?.whatIsThis[0]?.items[0]?.text.fr).toBeTruthy();
  });

  it("contains revised French titles for Systems 06, 07, and 08 without changing IDs", () => {
    expect(sections.find((section) => section.id === "6")?.title.fr).toBe(
      "Construction architecturale intérieure"
    );
    expect(sections.find((section) => section.id === "7")?.title.fr).toBe(
      "Finitions"
    );
    expect(sections.find((section) => section.id === "8")?.title.fr).toBe(
      "Services mécaniques"
    );
    expect(
      section06Activities.find((activity) => activity.id === "6.1")?.title.fr
    ).toBe("Maçonnerie intérieure");
    expect(
      section07Activities.find((activity) => activity.id === "7.1")?.title.fr
    ).toBe("Préparation du plancher en béton");
    expect(
      section08Activities.find((activity) => activity.id === "8.1")?.title.fr
    ).toBe("Plomberie – Eau domestique");
    expect(section06QuickViews[0]?.fieldTip?.fr).toBeTruthy();
    expect(section07QuickViews[0]?.fieldTip?.fr).toBeTruthy();
    expect(section08Learn[0]?.whatIsThis[0]?.items[0]?.text.fr).toBeTruthy();
  });

  it("contains revised French titles for Systems 09, 10, and 11 without changing IDs", () => {
    expect(sections.find((section) => section.id === "9")?.title.fr).toBe(
      "Services électriques du bâtiment"
    );
    expect(sections.find((section) => section.id === "10")?.title.fr).toBe(
      "Construction résistante au feu et sécurité des occupants"
    );
    expect(sections.find((section) => section.id === "11")?.title.fr).toBe(
      "Interfaces multidisciplinaires"
    );
    expect(
      section09Activities.find((activity) => activity.id === "9.1")?.title.fr
    ).toBe("Conduits / Canalisations électriques");
    expect(
      section10Activities.find((activity) => activity.id === "10.3")?.title.fr
    ).toBe("Calfeutrement coupe-feu");
    expect(
      section11Activities.find((activity) => activity.id === "11.1")?.title.fr
    ).toBe("Structure ↔ Architecture");
    expect(section09QuickViews[0]?.fieldTip?.fr).toBeTruthy();
    expect(section10QuickViews[0]?.fieldTip?.fr).toBeTruthy();
    expect(section11Learn[0]?.whatIsThis[0]?.items[0]?.text.fr).toBeTruthy();
  });

  it("contains revised French titles for Systems 12, 13, and 14 without changing IDs", () => {
    expect(sections.find((section) => section.id === "12")?.title.fr).toBe(
      "Travaux extérieurs"
    );
    expect(sections.find((section) => section.id === "13")?.title.fr).toBe(
      "Essais, mise en service et acceptation des systèmes"
    );
    expect(sections.find((section) => section.id === "14")?.title.fr).toBe(
      "Déficiences, achèvement et clôture"
    );
    expect(
      section12Activities.find((activity) => activity.id === "12.1")?.title.fr
    ).toBe("Services souterrains");
    expect(
      section13Activities.find((activity) => activity.id === "13.1")?.title.fr
    ).toBe("Préparation aux essais");
    expect(
      section14Activities.find((activity) => activity.id === "14.1")?.title.fr
    ).toBe("Examen préparatoire des déficiences");
    expect(section12QuickViews[0]?.fieldTip?.fr).toBeTruthy();
    expect(section13QuickViews[0]?.fieldTip?.fr).toBeTruthy();
    expect(section14Learn[0]?.whatIsThis[0]?.items[0]?.text.fr).toBeTruthy();
  });

  it("preserves authored item order and French coverage in representative records", () => {
    const activity = section01Activities.find((item) => item.id === "1.1");
    const quick = section01QuickViews.find((item) => item.activityId === "1.1");
    const learn = section01Learn.find((item) => item.activityId === "1.1");

    expect(activity?.id).toBe("1.1");
    expect(textValues(quick?.before ?? [])).toHaveLength(4);
    expect(textValues(activity?.requirements ?? [])).toHaveLength(4);
    expect(textValues(learn?.interfacesAndSequence ?? [])).toHaveLength(3);
    expect(textValues(quick?.before ?? [])[0]).toBe(
      "Confirmez les limites de travail, de démolition, d'accès et de protection sur les documents approuvés en vigueur."
    );
  });

  it("preserves authored item order in representative revised Systems 03, 04, and 05 records", () => {
    const system03Quick = section03QuickViews.find(
      (item) => item.activityId === "3.1"
    );
    const system04Activity = section04Activities.find(
      (item) => item.id === "4.1"
    );
    const system05Learn = section05Learn.find(
      (item) => item.activityId === "5.1"
    );

    expect(textValues(system03Quick?.before ?? [])[0]).toBe(
      "Confirmez les plans structurels à jour, la séquence de coulage, les joints, le étaiement de reprise, les ouvertures, les éléments encastrés, les tolérances, les exigences de finition, de formulation du mélange et d'essais."
    );
    expect(textValues(system04Activity?.requirements ?? [])).toHaveLength(3);
    expect(textValues(system05Learn?.interfacesAndSequence ?? [])).toHaveLength(
      3
    );
  });

  it("preserves authored item order in representative revised Systems 06, 07, and 08 records", () => {
    const system06Quick = section06QuickViews.find(
      (item) => item.activityId === "6.1"
    );
    const system07Activity = section07Activities.find(
      (item) => item.id === "7.1"
    );
    const system08Learn = section08Learn.find(
      (item) => item.activityId === "8.1"
    );

    expect(textValues(system06Quick?.before ?? [])[0]).toBe(
      "Confirmez les types de murs, le type et résistance des unités, le mortier et coulis, le renfort, l'ancrage, l’appareillage et les assises, les dimensions, les hauteurs, les ouvertures, les linteaux, les joints, les exigences de feu/acoustique et les tolérances."
    );
    expect(textValues(system07Activity?.requirements ?? [])).toHaveLength(3);
    expect(textValues(system08Learn?.interfacesAndSequence ?? [])).toHaveLength(
      3
    );
  });

  it("preserves authored item order in representative revised Systems 09, 10, and 11 records", () => {
    const system09Quick = section09QuickViews.find(
      (item) => item.activityId === "9.1"
    );
    const system10Activity = section10Activities.find(
      (item) => item.id === "10.1"
    );
    const system11Learn = section11Learn.find(
      (item) => item.activityId === "11.1"
    );

    expect(textValues(system09Quick?.before ?? [])[0]).toBe(
      "Confirmez le type, la taille, le tracé, l'élévation, la taux de remplissage en conducteurs, les limites de courbe, le support, l'expansion, l'étanchéité, la classement selon l’environnement, l'emplacement des boîtes, les pénétrations et l’identification à partir des documents approuvés actuels."
    );
    expect(textValues(system10Activity?.requirements ?? [])).toHaveLength(3);
    expect(textValues(system11Learn?.interfacesAndSequence ?? [])).toHaveLength(
      3
    );
  });

  it("preserves authored item order in representative revised Systems 12, 13, and 14 records", () => {
    const system12Quick = section12QuickViews.find(
      (item) => item.activityId === "12.1"
    );
    const system13Activity = section13Activities.find(
      (item) => item.id === "13.1"
    );
    const system14Learn = section14Learn.find(
      (item) => item.activityId === "14.1"
    );

    expect(textValues(system12Quick?.before ?? [])[0]).toBe(
      "Confirmez le type d'service, l'alignement, les coordonnées, le profil et cotes de radier, la profondeur/la couverture, le matériau/la classe/la taille, les joints, la stratification, la séparation, les croisements, les structures, la protection, les essais et les exigences de connexion."
    );
    expect(textValues(system13Activity?.requirements ?? [])).toHaveLength(3);
    expect(textValues(system14Learn?.interfacesAndSequence ?? [])).toHaveLength(
      3
    );
  });
});
