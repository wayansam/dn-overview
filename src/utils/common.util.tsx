import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { TableResource } from "../constants/Common.constants";
import { ITEM_RARITY_COLOR } from "../constants/InGame.color.constants";
import { ITEM_RARITY } from "../constants/InGame.constants";
import {
  columnCommonItemFlag,
  CommonItemStats,
} from "../interface/ItemStat.interface";
const { Text } = Typography;

export const getColor = (type: ITEM_RARITY, custom?: string) => {
  switch (type) {
    case ITEM_RARITY.NORMAL:
      return ITEM_RARITY_COLOR.NORMAL;
    case ITEM_RARITY.MAGIC:
      return ITEM_RARITY_COLOR.MAGIC;
    case ITEM_RARITY.RARE:
      return ITEM_RARITY_COLOR.RARE;
    case ITEM_RARITY.EPIC:
      return ITEM_RARITY_COLOR.EPIC;
    case ITEM_RARITY.UNIQUE:
      return ITEM_RARITY_COLOR.UNIQUE;
    case ITEM_RARITY.LEGEND:
      return ITEM_RARITY_COLOR.LEGEND;
    case ITEM_RARITY.ANCIENT:
      return ITEM_RARITY_COLOR.ANCIENT;

    default:
      return custom ?? ITEM_RARITY_COLOR.CRAFT;
  }
};

export const getBDTalisFd = (type: ITEM_RARITY) => {
  switch (type) {
    case ITEM_RARITY.UNIQUE:
      return [0, 149, 298];
    case ITEM_RARITY.LEGEND:
      return [149, 298, 447];
    case ITEM_RARITY.ANCIENT:
      return [298, 447, 596];

    default:
      return [];
  }
};

export const getTextEmpty = ({
  txt,
  tailText,
  customChange,
}: {
  txt: string | number | undefined;
  tailText?: string;
  customChange?: string;
}) => {
  return txt ? `${txt.toLocaleString()}${tailText ?? ""}` : customChange ?? "-";
};

export function getComparedData<T>(arr: Array<T>, min: number, max: number) {
  const dt1 = arr.length >= min ? arr[min - 1] : undefined;
  const dt2 = arr.length >= max ? arr[max - 1] : undefined;
  return { dt1, dt2 };
}

export const columnsResource: ColumnsType<TableResource> = [
  {
    title: "Materials",
    dataIndex: "mats",
    render: (_, { mats, customLabel }) => (
      <Text
        key={`col-resource-name-${mats}`}
        style={{ color: customLabel?.lunarStyle?.color ?? undefined }}
      >
        {mats}
      </Text>
    ),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    width: 150,
    render: (_, { amount, mats }) => (
      <Text key={`col-resource-value-${mats}`}>{amount.toLocaleString()}</Text>
    ),
  },
];

export const copyTextToClipboard = async (txt: string) => {
  try {
    await navigator.clipboard.writeText(txt);
    console.log("Content copied to clipboard");
    // messageApi.open({
    //   type: 'success',
    //   content: 'This is a success message',
    // });
  } catch (err) {
    console.error("Failed to copy: ", err);
    // messageApi.open({
    //   type: 'error',
    //   content: 'This is an error message',
    // });
  }
};

export function typedEntries<T extends {}>(obj: T): [string, T[keyof T]][] {
  return Object.entries(obj) as [string, T[keyof T]][];
}

export const getColumnsStats = ({
  phyMagAtkFlag,
  phyMagAtkMinFlag,
  phyMagAtkMaxFlag,
  phyMagAtkPercentFlag,
  attAtkPercentFlag,
  crtFlag,
  crtPercentFlag,
  cdmFlag,
  fdFlag,
  strFlag,
  agiFlag,
  intFlag,
  vitFlag,
  strPercentFlag,
  agiPercentFlag,
  intPercentFlag,
  vitPercentFlag,
  defFlag,
  magdefFlag,
  defPercentFlag,
  magdefPercentFlag,
  hpFlag,
  hpPercentFlag,
  moveSpeedPercentFlag,
  moveSpeedPercentTownFlag,
}: columnCommonItemFlag): ColumnsType<CommonItemStats> => {
  const temp: ColumnsType<CommonItemStats> = [];
  const smallItemTitle: string[] = [];
  if (phyMagAtkFlag) {
    smallItemTitle.push("ATK");
    temp.push({
      title: "Attack",
      responsive: ["sm"],
      render: (_, { phyMagAtk }) => (
        <div>
          <Text>{getTextEmpty({ txt: phyMagAtk })}</Text>
        </div>
      ),
    });
  }
  if (phyMagAtkMinFlag && phyMagAtkMaxFlag) {
    smallItemTitle.push("ATK");
    temp.push({
      title: "Attack",
      responsive: ["sm"],
      render: (_, { phyMagAtkMin, phyMagAtkMax }) => (
        <div>
          <Text>
            {getTextEmpty({
              txt:
                phyMagAtkMin && phyMagAtkMax
                  ? `${phyMagAtkMin.toLocaleString()} - ${phyMagAtkMax.toLocaleString()}`
                  : undefined,
            })}
          </Text>
        </div>
      ),
    });
  }
  if (phyMagAtkPercentFlag) {
    smallItemTitle.push("ATK(%)");
    temp.push({
      title: "Attack(%)",
      responsive: ["sm"],
      render: (_, { phyMagAtkPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (attAtkPercentFlag) {
    smallItemTitle.push("ATT(%)");
    temp.push({
      title: "Attribute(%)",
      responsive: ["sm"],
      render: (_, { attAtkPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: attAtkPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (crtFlag) {
    smallItemTitle.push("CRT");
    temp.push({
      title: "CRT",
      responsive: ["sm"],
      render: (_, { crt }) => (
        <div>
          <Text>{getTextEmpty({ txt: crt })}</Text>
        </div>
      ),
    });
  }
  if (crtPercentFlag) {
    smallItemTitle.push("CRT(%)");
    temp.push({
      title: "CRT(%)",
      responsive: ["sm"],
      render: (_, { crtPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: crtPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (cdmFlag) {
    smallItemTitle.push("CDM");
    temp.push({
      title: "CDM",
      responsive: ["sm"],
      render: (_, { cdm }) => (
        <div>
          <Text>{getTextEmpty({ txt: cdm })}</Text>
        </div>
      ),
    });
  }
  if (fdFlag) {
    smallItemTitle.push("FD");
    temp.push({
      title: "FD",
      responsive: ["sm"],
      render: (_, { fd }) => (
        <div>
          <Text>{getTextEmpty({ txt: fd })}</Text>
        </div>
      ),
    });
  }
  if (strFlag) {
    smallItemTitle.push("STR");
    temp.push({
      title: "STR",
      responsive: ["sm"],
      render: (_, { str }) => (
        <div>
          <Text>{getTextEmpty({ txt: str })}</Text>
        </div>
      ),
    });
  }
  if (agiFlag) {
    smallItemTitle.push("AGI");
    temp.push({
      title: "AGI",
      responsive: ["sm"],
      render: (_, { agi }) => (
        <div>
          <Text>{getTextEmpty({ txt: agi })}</Text>
        </div>
      ),
    });
  }
  if (intFlag) {
    smallItemTitle.push("INT");
    temp.push({
      title: "INT",
      responsive: ["sm"],
      render: (_, { int }) => (
        <div>
          <Text>{getTextEmpty({ txt: int })}</Text>
        </div>
      ),
    });
  }
  if (vitFlag) {
    smallItemTitle.push("VIT");
    temp.push({
      title: "VIT",
      responsive: ["sm"],
      render: (_, { vit }) => (
        <div>
          <Text>{getTextEmpty({ txt: vit })}</Text>
        </div>
      ),
    });
  }
  if (strPercentFlag) {
    smallItemTitle.push("STR(%)");
    temp.push({
      title: "STR(%)",
      responsive: ["sm"],
      render: (_, { strPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: strPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (agiPercentFlag) {
    smallItemTitle.push("AGI(%)");
    temp.push({
      title: "AGI(%)",
      responsive: ["sm"],
      render: (_, { agiPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: agiPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (intPercentFlag) {
    smallItemTitle.push("INT(%)");
    temp.push({
      title: "INT(%)",
      responsive: ["sm"],
      render: (_, { intPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: intPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (vitPercentFlag) {
    smallItemTitle.push("VIT(%)");
    temp.push({
      title: "VIT(%)",
      responsive: ["sm"],
      render: (_, { vitPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: vitPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (defFlag) {
    smallItemTitle.push("Phy Def");
    temp.push({
      title: "Phy Def",
      responsive: ["sm"],
      render: (_, { def }) => (
        <div>
          <Text>{getTextEmpty({ txt: def })}</Text>
        </div>
      ),
    });
  }
  if (magdefFlag) {
    smallItemTitle.push("Mag Def");
    temp.push({
      title: "Mag Def",
      responsive: ["sm"],
      render: (_, { magdef }) => (
        <div>
          <Text>{getTextEmpty({ txt: magdef })}</Text>
        </div>
      ),
    });
  }
  if (defPercentFlag) {
    smallItemTitle.push("Phy Def(%)");
    temp.push({
      title: "Phy Def(%)",
      responsive: ["sm"],
      render: (_, { defPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: defPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (magdefPercentFlag) {
    smallItemTitle.push("Mag Def(%)");
    temp.push({
      title: "Mag Def(%)",
      responsive: ["sm"],
      render: (_, { magdefPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: magdefPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (hpFlag) {
    smallItemTitle.push("HP");
    temp.push({
      title: "HP",
      responsive: ["sm"],
      render: (_, { hp }) => (
        <div>
          <Text>{getTextEmpty({ txt: hp })}</Text>
        </div>
      ),
    });
  }
  if (hpPercentFlag) {
    smallItemTitle.push("HP(%)");
    temp.push({
      title: "HP(%)",
      responsive: ["sm"],
      render: (_, { hpPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: hpPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (moveSpeedPercentFlag) {
    smallItemTitle.push("Movespeed(%)");
    temp.push({
      title: "Movespeed(%)",
      responsive: ["sm"],
      render: (_, { moveSpeedPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: moveSpeedPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (moveSpeedPercentTownFlag) {
    smallItemTitle.push("Movespeed(%)");
    temp.push({
      title: "Movespeed(%)",
      responsive: ["sm"],
      render: (_, { moveSpeedPercentTown }) => (
        <div>
          <Text>
            {getTextEmpty({ txt: moveSpeedPercentTown, tailText: "%" })}
          </Text>
        </div>
      ),
    });
  }

  return [
    {
      title: "Enhancement",
      dataIndex: "encLevel",
    },
    {
      title: (
        <div>
          {smallItemTitle.map((it) => (
            <p key={`title-${it}`}>{it}</p>
          ))}
        </div>
      ),
      responsive: ["xs"],
      width: 150,
      render: (
        _,
        {
          phyMagAtk,
          phyMagAtkMin,
          phyMagAtkMax,
          phyMagAtkPercent,
          attAtkPercent,
          crt,
          crtPercent,
          cdm,
          fd,
          str,
          agi,
          int,
          vit,
          strPercent,
          agiPercent,
          intPercent,
          vitPercent,
          def,
          magdef,
          defPercent,
          magdefPercent,
          hp,
          hpPercent,
          moveSpeedPercent,
          moveSpeedPercentTown,
        }
      ) => (
        <div>
          {phyMagAtkFlag && <p>ATK {getTextEmpty({ txt: phyMagAtk })}</p>}
          {phyMagAtkMinFlag && phyMagAtkMaxFlag && (
            <p>
              ATK{" "}
              {getTextEmpty({
                txt:
                  phyMagAtkMin && phyMagAtkMax
                    ? `${phyMagAtkMin} - ${phyMagAtkMax}`
                    : undefined,
              })}
            </p>
          )}
          {phyMagAtkPercentFlag && (
            <p>ATK {getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}</p>
          )}
          {attAtkPercentFlag && (
            <p>Ele {getTextEmpty({ txt: attAtkPercent, tailText: "%" })}</p>
          )}
          {crtFlag && <p>CRT {getTextEmpty({ txt: crt })}</p>}
          {crtPercentFlag && (
            <p>CRT {getTextEmpty({ txt: crtPercent, tailText: "%" })}</p>
          )}
          {cdmFlag && <p>CDM {getTextEmpty({ txt: cdm })}</p>}
          {fdFlag && <p>FD {getTextEmpty({ txt: fd })}</p>}
          {strFlag && <p>STR {getTextEmpty({ txt: str })}</p>}
          {agiFlag && <p>AGI {getTextEmpty({ txt: agi })}</p>}
          {intFlag && <p>INT {getTextEmpty({ txt: int })}</p>}
          {vitFlag && <p>VIT {getTextEmpty({ txt: vit })}</p>}
          {strPercentFlag && (
            <p>STR {getTextEmpty({ txt: strPercent, tailText: "%" })}</p>
          )}
          {agiPercentFlag && (
            <p>AGI {getTextEmpty({ txt: agiPercent, tailText: "%" })}</p>
          )}
          {intPercentFlag && (
            <p>INT {getTextEmpty({ txt: intPercent, tailText: "%" })}</p>
          )}
          {vitPercentFlag && (
            <p>VIT {getTextEmpty({ txt: vitPercent, tailText: "%" })}</p>
          )}
          {defFlag && <p>Phy Def {getTextEmpty({ txt: def })}</p>}
          {magdefFlag && <p>Mag Def {getTextEmpty({ txt: magdef })}</p>}
          {defPercentFlag && <p>Phy Def {getTextEmpty({ txt: defPercent })}</p>}
          {magdefPercentFlag && (
            <p>Mag Def {getTextEmpty({ txt: magdefPercent })}</p>
          )}
          {hpFlag && <p>HP {getTextEmpty({ txt: hp })}</p>}
          {hpPercentFlag && (
            <p>HP {getTextEmpty({ txt: hpPercent, tailText: "%" })}</p>
          )}
          {moveSpeedPercentFlag && (
            <p>
              Movespeed {getTextEmpty({ txt: moveSpeedPercent, tailText: "%" })}
            </p>
          )}
          {moveSpeedPercentTownFlag && (
            <p>
              Movespeed Town{" "}
              {getTextEmpty({ txt: moveSpeedPercentTown, tailText: "%" })}
            </p>
          )}
        </div>
      ),
    },
    ...temp,
  ];
};

export const getSuccessRateTag = (key: string, dt: Array<number>) => {
  const another100 = dt.some((it) => it < 100);
  return another100 ? (
    <Tag
      key={`tag-fail-${key}`}
      icon={<ExclamationCircleOutlined />}
      color="warning"
    >
      might fail
    </Tag>
  ) : (
    <Tag
      key={`tag-success-${key}`}
      icon={<CheckCircleOutlined />}
      color="success"
    >
      100% success
    </Tag>
  );
};

export const getBreakTag = (key: string, dt: number[]) => {
  const canBreak = dt.some((it) => it > 0);
  return canBreak ? (
    <Tag key={`tag-break-${key}`} icon={<MinusCircleOutlined />} color="error">
      might break
    </Tag>
  ) : undefined;
};

export const getDeductTag = (key: string, dt: number[]) => {
  const canReduce = dt.some((it) => it > 0);
  return canReduce ? (
    <Tag
      key={`tag-minus-${key}`}
      icon={<ExclamationCircleOutlined />}
      color="error"
    >
      might -1
    </Tag>
  ) : undefined;
};

export function combineEqStats(
  a: CommonItemStats,
  b: CommonItemStats,
  operation: "add" | "minus"
): CommonItemStats {
  const result: CommonItemStats = { ...a };

  const keys = Object.keys({ ...a, ...b }) as (keyof CommonItemStats)[];

  for (const key of keys) {
    const valueA = a[key];
    const valueB = b[key];

    if (typeof valueA === "number" && typeof valueB === "number") {
      const computed = operation === "add" ? valueA + valueB : valueA - valueB;

      (result as any)[key] = computed;
    }
  }

  return result;
}
export function multiplyEqStats(
  a: CommonItemStats,
  n: number
): CommonItemStats {
  const result: CommonItemStats = { ...a };

  const keys = Object.keys({ ...result }) as (keyof CommonItemStats)[];

  for (const key of keys) {
    const valueA = a[key];

    if (typeof valueA === "number") {
      const computed = valueA * n;

      (result as any)[key] = computed;
    }
  }

  return result;
}
export const getStatDif = (statDif?: CommonItemStats) => {
  if (!statDif) {
    return [];
  }
  return [
    {
      title: "ATK",
      value: statDif.phyMagAtk,
      format: true,
    },
    {
      title: "ATK Min",
      value: statDif.phyMagAtkMin,
      format: true,
    },
    {
      title: "ATK Max",
      value: statDif.phyMagAtkMax,
      format: true,
    },
    {
      title: "ATK",
      value: statDif.phyMagAtkPercent,
      suffix: "%",
      format: true,
    },
    {
      title: "Ele",
      value: statDif.attAtkPercent,
      suffix: "%",
      format: true,
    },
    {
      title: "CRT",
      value: statDif.crt,
      format: true,
    },
    {
      title: "CRT",
      value: statDif.crtPercent,
      suffix: "%",
      format: true,
    },
    {
      title: "CDM",
      value: statDif.cdm,
      format: true,
    },
    {
      title: "FD",
      value: statDif.fd,
      format: true,
    },
    {
      title: "STR",
      value: statDif.str,
      format: true,
    },
    {
      title: "AGI",
      value: statDif.agi,
      format: true,
    },
    {
      title: "INT",
      value: statDif.int,
      format: true,
    },
    {
      title: "VIT",
      value: statDif.vit,
      format: true,
    },
    {
      title: "STR",
      value: statDif.strPercent,
      suffix: "%",
      format: true,
    },
    {
      title: "AGI",
      value: statDif.agiPercent,
      suffix: "%",
      format: true,
    },
    {
      title: "INT",
      value: statDif.intPercent,
      suffix: "%",
      format: true,
    },
    {
      title: "VIT",
      value: statDif.vitPercent,
      suffix: "%",
      format: true,
    },
    {
      title: "Phy Def",
      value: statDif.def,
      format: true,
    },
    {
      title: "Mag Def",
      value: statDif.magdef,
      format: true,
    },
    {
      title: "Phy Def",
      value: statDif.defPercent,
      suffix: "%",
      format: true,
    },
    {
      title: "Mag Def",
      value: statDif.magdefPercent,
      suffix: "%",
      format: true,
    },
    {
      title: "HP",
      value: statDif.hp,
      format: true,
    },
    {
      title: "HP",
      value: statDif.hpPercent,
      suffix: "%",
      format: true,
    },
    {
      title: "Movespeed",
      value: statDif.moveSpeedPercent,
      suffix: "%",
      format: true,
    },
    {
      title: "Movespeed Town",
      value: statDif.moveSpeedPercentTown,
      suffix: "%",
      format: true,
    },
  ];
};
