import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
} from "@ant-design/icons";
import { Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  EmptyCommonnStat,
  EmptyCommonStatDesc,
  TableResource,
} from "../constants/Common.constants";
import { ITEM_RARITY_COLOR } from "../constants/InGame.color.constants";
import { ITEM_RARITY } from "../constants/InGame.constants";
import {
  columnCommonItemDesc,
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

export const getCustomColumnResource = ({
  customMatsTitle,
  customAmountTitle,
}: {
  customMatsTitle?: string;
  customAmountTitle?: string;
}): ColumnsType<TableResource> => {
  return columnsResource.map((it, idx) => {
    if (idx === 0 && customMatsTitle) {
      return { ...it, title: customMatsTitle };
    } else if (idx === 1 && customAmountTitle) {
      return { ...it, title: customAmountTitle };
    } else return it;
  });
};

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

  const {
    phyMagAtkDesc,
    phyMagAtkMinDesc,
    phyMagAtkMaxDesc,
    phyMagAtkPercentDesc,
    attAtkPercentDesc,
    crtDesc,
    crtPercentDesc,
    cdmDesc,
    fdDesc,
    strDesc,
    agiDesc,
    intDesc,
    vitDesc,
    strPercentDesc,
    agiPercentDesc,
    intPercentDesc,
    vitPercentDesc,
    defDesc,
    magdefDesc,
    defPercentDesc,
    magdefPercentDesc,
    hpDesc,
    hpPercentDesc,
    moveSpeedPercentDesc,
    moveSpeedPercentTownDesc,
  } = getAllStatDesc();

  if (phyMagAtkFlag && phyMagAtkDesc) {
    const { long, short } = phyMagAtkDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { phyMagAtk }) => (
        <div>
          <Text>{getTextEmpty({ txt: phyMagAtk })}</Text>
        </div>
      ),
    });
  }
  if (phyMagAtkMinFlag && phyMagAtkMaxFlag && phyMagAtkDesc) {
    const { long, short } = phyMagAtkDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
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
  if (phyMagAtkPercentFlag && phyMagAtkPercentDesc) {
    const { long, short } = phyMagAtkPercentDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { phyMagAtkPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (attAtkPercentFlag && attAtkPercentDesc) {
    const { long, short } = attAtkPercentDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { attAtkPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: attAtkPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (crtFlag && crtDesc) {
    const { long, short } = crtDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { crt }) => (
        <div>
          <Text>{getTextEmpty({ txt: crt })}</Text>
        </div>
      ),
    });
  }
  if (crtPercentFlag && crtPercentDesc) {
    const { long, short } = crtPercentDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { crtPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: crtPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (cdmFlag && cdmDesc) {
    const { long, short } = cdmDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { cdm }) => (
        <div>
          <Text>{getTextEmpty({ txt: cdm })}</Text>
        </div>
      ),
    });
  }
  if (fdFlag && fdDesc) {
    const { long, short } = fdDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { fd }) => (
        <div>
          <Text>{getTextEmpty({ txt: fd })}</Text>
        </div>
      ),
    });
  }
  if (strFlag && strDesc) {
    const { long, short } = strDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { str }) => (
        <div>
          <Text>{getTextEmpty({ txt: str })}</Text>
        </div>
      ),
    });
  }
  if (agiFlag && agiDesc) {
    const { long, short } = agiDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { agi }) => (
        <div>
          <Text>{getTextEmpty({ txt: agi })}</Text>
        </div>
      ),
    });
  }
  if (intFlag && intDesc) {
    const { long, short } = intDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { int }) => (
        <div>
          <Text>{getTextEmpty({ txt: int })}</Text>
        </div>
      ),
    });
  }
  if (vitFlag && vitDesc) {
    const { long, short } = vitDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { vit }) => (
        <div>
          <Text>{getTextEmpty({ txt: vit })}</Text>
        </div>
      ),
    });
  }
  if (strPercentFlag && strPercentDesc) {
    const { long, short } = strPercentDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { strPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: strPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (agiPercentFlag && agiPercentDesc) {
    const { long, short } = agiPercentDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { agiPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: agiPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (intPercentFlag && intPercentDesc) {
    const { long, short } = intPercentDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { intPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: intPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (vitPercentFlag && vitPercentDesc) {
    const { long, short } = vitPercentDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { vitPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: vitPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (defFlag && defDesc) {
    const { long, short } = defDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { def }) => (
        <div>
          <Text>{getTextEmpty({ txt: def })}</Text>
        </div>
      ),
    });
  }
  if (magdefFlag && magdefDesc) {
    const { long, short } = magdefDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { magdef }) => (
        <div>
          <Text>{getTextEmpty({ txt: magdef })}</Text>
        </div>
      ),
    });
  }
  if (defPercentFlag && defPercentDesc) {
    const { long, short } = defPercentDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { defPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: defPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (magdefPercentFlag && magdefPercentDesc) {
    const { long, short } = magdefPercentDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { magdefPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: magdefPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (hpFlag && hpDesc) {
    const { long, short } = hpDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { hp }) => (
        <div>
          <Text>{getTextEmpty({ txt: hp })}</Text>
        </div>
      ),
    });
  }
  if (hpPercentFlag && hpPercentDesc) {
    const { long, short } = hpPercentDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { hpPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: hpPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (moveSpeedPercentFlag && moveSpeedPercentDesc) {
    const { long, short } = moveSpeedPercentDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
      responsive: ["sm"],
      render: (_, { moveSpeedPercent }) => (
        <div>
          <Text>{getTextEmpty({ txt: moveSpeedPercent, tailText: "%" })}</Text>
        </div>
      ),
    });
  }
  if (moveSpeedPercentTownFlag && moveSpeedPercentTownDesc) {
    const { long, short } = moveSpeedPercentTownDesc;
    smallItemTitle.push(short);
    temp.push({
      title: long,
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
          {phyMagAtkFlag && (
            <p>
              {`${phyMagAtkDesc?.short} `}
              {getTextEmpty({ txt: phyMagAtk })}
            </p>
          )}
          {phyMagAtkMinFlag && phyMagAtkMaxFlag && (
            <p>
              {`${phyMagAtkDesc?.short} `}
              {getTextEmpty({
                txt:
                  phyMagAtkMin && phyMagAtkMax
                    ? `${phyMagAtkMin} - ${phyMagAtkMax}`
                    : undefined,
              })}
            </p>
          )}
          {phyMagAtkPercentFlag && (
            <p>
              {`${phyMagAtkPercentDesc?.short} `}
              {getTextEmpty({ txt: phyMagAtkPercent, tailText: "%" })}
            </p>
          )}
          {attAtkPercentFlag && (
            <p>
              {`${attAtkPercentDesc?.short} `}
              {getTextEmpty({ txt: attAtkPercent, tailText: "%" })}
            </p>
          )}
          {crtFlag && (
            <p>
              {`${crtDesc?.short} `}
              {getTextEmpty({ txt: crt })}
            </p>
          )}
          {crtPercentFlag && (
            <p>
              {`${crtPercentDesc?.short} `}
              {getTextEmpty({ txt: crtPercent, tailText: "%" })}
            </p>
          )}
          {cdmFlag && (
            <p>
              {`${cdmDesc?.short} `}
              {getTextEmpty({ txt: cdm })}
            </p>
          )}
          {fdFlag && (
            <p>
              {`${fdDesc?.short} `}
              {getTextEmpty({ txt: fd })}
            </p>
          )}
          {strFlag && (
            <p>
              {`${strDesc?.short} `}
              {getTextEmpty({ txt: str })}
            </p>
          )}
          {agiFlag && (
            <p>
              {`${agiDesc?.short} `}
              {getTextEmpty({ txt: agi })}
            </p>
          )}
          {intFlag && (
            <p>
              {`${intDesc?.short} `}
              {getTextEmpty({ txt: int })}
            </p>
          )}
          {vitFlag && (
            <p>
              {`${vitDesc?.short} `}
              {getTextEmpty({ txt: vit })}
            </p>
          )}
          {strPercentFlag && (
            <p>
              {`${strPercentDesc?.short} `}
              {getTextEmpty({ txt: strPercent, tailText: "%" })}
            </p>
          )}
          {agiPercentFlag && (
            <p>
              {`${agiPercentDesc?.short} `}
              {getTextEmpty({ txt: agiPercent, tailText: "%" })}
            </p>
          )}
          {intPercentFlag && (
            <p>
              {`${intPercentDesc?.short} `}
              {getTextEmpty({ txt: intPercent, tailText: "%" })}
            </p>
          )}
          {vitPercentFlag && (
            <p>
              {`${vitPercentDesc?.short} `}
              {getTextEmpty({ txt: vitPercent, tailText: "%" })}
            </p>
          )}
          {defFlag && (
            <p>
              {`${defDesc?.short} `}
              {getTextEmpty({ txt: def })}
            </p>
          )}
          {magdefFlag && (
            <p>
              {`${magdefDesc?.short} `}
              {getTextEmpty({ txt: magdef })}
            </p>
          )}
          {defPercentFlag && (
            <p>
              {`${defPercentDesc?.short} `}
              {getTextEmpty({ txt: defPercent })}
            </p>
          )}
          {magdefPercentFlag && (
            <p>
              {`${magdefPercentDesc?.short} `}
              {getTextEmpty({ txt: magdefPercent })}
            </p>
          )}
          {hpFlag && (
            <p>
              {`${hpDesc?.short} `}
              {getTextEmpty({ txt: hp })}
            </p>
          )}
          {hpPercentFlag && (
            <p>
              {`${hpPercentDesc?.short} `}
              {getTextEmpty({ txt: hpPercent, tailText: "%" })}
            </p>
          )}
          {moveSpeedPercentFlag && (
            <p>
              {`${moveSpeedPercentDesc?.short} `}
              {getTextEmpty({ txt: moveSpeedPercent, tailText: "%" })}
            </p>
          )}
          {moveSpeedPercentTownFlag && (
            <p>
              {`${moveSpeedPercentTownDesc?.short} `}
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
      title: getStatDesc("phyMagAtk").short,
      value: statDif.phyMagAtk,
      format: true,
    },
    {
      title: getStatDesc("phyMagAtkMin").short,
      value: statDif.phyMagAtkMin,
      format: true,
    },
    {
      title: getStatDesc("phyMagAtkMax").short,
      value: statDif.phyMagAtkMax,
      format: true,
    },
    {
      title: getStatDesc("phyMagAtkPercent").short,
      value: statDif.phyMagAtkPercent,
      suffix: "%",
      format: true,
    },
    {
      title: getStatDesc("attAtkPercent").short,
      value: statDif.attAtkPercent,
      suffix: "%",
      format: true,
    },
    {
      title: getStatDesc("crt").short,
      value: statDif.crt,
      format: true,
    },
    {
      title: getStatDesc("crtPercent").short,
      value: statDif.crtPercent,
      suffix: "%",
      format: true,
    },
    {
      title: getStatDesc("cdm").short,
      value: statDif.cdm,
      format: true,
    },
    {
      title: getStatDesc("fd").short,
      value: statDif.fd,
      format: true,
    },
    {
      title: getStatDesc("str").short,
      value: statDif.str,
      format: true,
    },
    {
      title: getStatDesc("agi").short,
      value: statDif.agi,
      format: true,
    },
    {
      title: getStatDesc("int").short,
      value: statDif.int,
      format: true,
    },
    {
      title: getStatDesc("vit").short,
      value: statDif.vit,
      format: true,
    },
    {
      title: getStatDesc("strPercent").short,
      value: statDif.strPercent,
      suffix: "%",
      format: true,
    },
    {
      title: getStatDesc("agiPercent").short,
      value: statDif.agiPercent,
      suffix: "%",
      format: true,
    },
    {
      title: getStatDesc("intPercent").short,
      value: statDif.intPercent,
      suffix: "%",
      format: true,
    },
    {
      title: getStatDesc("vitPercent").short,
      value: statDif.vitPercent,
      suffix: "%",
      format: true,
    },
    {
      title: getStatDesc("def").short,
      value: statDif.def,
      format: true,
    },
    {
      title: getStatDesc("magdef").short,
      value: statDif.magdef,
      format: true,
    },
    {
      title: getStatDesc("defPercent").short,
      value: statDif.defPercent,
      suffix: "%",
      format: true,
    },
    {
      title: getStatDesc("magdefPercent").short,
      value: statDif.magdefPercent,
      suffix: "%",
      format: true,
    },
    {
      title: getStatDesc("hp").short,
      value: statDif.hp,
      format: true,
    },
    {
      title: getStatDesc("hpPercent").short,
      value: statDif.hpPercent,
      suffix: "%",
      format: true,
    },
    {
      title: getStatDesc("moveSpeedPercent").short,
      value: statDif.moveSpeedPercent,
      suffix: "%",
      format: true,
    },
    {
      title: getStatDesc("moveSpeedPercentTown").short,
      value: statDif.moveSpeedPercentTown,
      suffix: "%",
      format: true,
    },
  ];
};

export const getStatDesc = (
  key: keyof CommonItemStats
): { long: string; short: string } => {
  switch (key) {
    case "phyMagAtk":
      return { long: "Attack", short: "ATK" };
    case "phyMagAtkMin":
      return { long: "Attack Min", short: "ATK Min" };
    case "phyMagAtkMax":
      return { long: "Attack Max", short: "ATK Max" };
    case "phyMagAtkPercent":
      return { long: "Attack(%)", short: "ATK(%)" };
    case "attAtkPercent":
      return { long: "Attribute(%)", short: "ATT(%)" };
    case "crt":
      return { long: "CRT", short: "CRT" };
    case "crtPercent":
      return { long: "CRT(%)", short: "CRT(%)" };
    case "cdm":
      return { long: "CDM", short: "CDM" };
    case "fd":
      return { long: "FD", short: "FD" };
    case "str":
      return { long: "STR", short: "STR" };
    case "agi":
      return { long: "AGI", short: "AGI" };
    case "int":
      return { long: "INT", short: "INT" };
    case "vit":
      return { long: "VIT", short: "VIT" };
    case "strPercent":
      return { long: "STR(%)", short: "STR(%)" };
    case "agiPercent":
      return { long: "AGI(%)", short: "AGI(%)" };
    case "intPercent":
      return { long: "INT(%)", short: "INT(%)" };
    case "vitPercent":
      return { long: "VIT(%)", short: "VIT(%)" };
    case "def":
      return { long: "Phy Def", short: "Phy Def" };
    case "defPercent":
      return { long: "Phy Def(%)", short: "Phy Def(%)" };
    case "magdef":
      return { long: "Mag Def", short: "Mag Def" };
    case "magdefPercent":
      return { long: "Mag Def(%)", short: "Mag Def(%)" };
    case "hp":
      return { long: "HP", short: "HP" };
    case "hpPercent":
      return { long: "HP(%)", short: "HP(%)" };
    case "moveSpeedPercent":
      return { long: "Movespeed(%)", short: "Movespeed(%)" };
    case "moveSpeedPercentTown":
      return { long: "Movespeed Town(%)", short: "Movespeed Town(%)" };

    default:
      return { long: "-", short: "-" };
  }
};

export const getAllStatDesc = (): columnCommonItemDesc => {
  let result: columnCommonItemDesc = { ...EmptyCommonStatDesc };
  const keys = Object.keys({
    ...EmptyCommonnStat,
  }) as (keyof CommonItemStats)[];

  for (const key of keys) {
    const value = getStatDesc(key);
    (result as any)[`${key}Desc`] = value;
  }
  return result;
};
