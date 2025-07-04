import { Collapse, Divider, List, Space, Typography } from "antd";
import { BaseType } from "antd/es/typography/Base";
import Link from "antd/es/typography/Link";
import { TAB_KEY } from "../constants/Common.constants";
import { useAppDispatch } from "../hooks";
import { SideBarTab } from "../interface/Common.interface";
import { setSelectedSideBar } from "../slice/UIState.reducer";

interface ReleaseNotesProps {
  onlyNew?: boolean;
}

const ReleaseNotes = ({ onlyNew }: ReleaseNotesProps) => {
  const dispatch = useAppDispatch();
  enum keyUpdate {
    N = "New",
    U = "Update",
    P = "Planned",
    I = "In Progress",
    D = "Done",
  }

  interface FeatureItem {
    label: string;
    key: keyUpdate;
    link?: SideBarTab;
    date?: string;
  }
  const getType = (item: FeatureItem): BaseType | undefined => {
    if (item.key === keyUpdate.N) {
      return "success";
    }
    if (item.key === keyUpdate.U) {
      return "warning";
    }
    if (item.key === keyUpdate.P) {
      return "secondary";
    }
    if (item.key === keyUpdate.I) {
      return "danger";
    }
    return;
  };
  const renderItem = (item: FeatureItem) => (
    <List.Item>
      <Typography.Text type={getType(item)}>[{item.key}] </Typography.Text>
      {`${item.label} `}
      {item?.link && (
        <Link
          onClick={() => {
            if (item?.link) {
              dispatch(setSelectedSideBar(item.link));
            }
          }}
          target="_blank"
        >
          [Check Out]
        </Link>
      )}
      {item?.date && <Typography.Text> [{item.date}] </Typography.Text>}
    </List.Item>
  );

  const dataNew: Array<FeatureItem> = [
    {
      key: keyUpdate.U,
      label: "Conversion Costume Armor Legend Enhancement",
      link: {
        key: TAB_KEY.miscConversion,
        name: TAB_KEY.miscConversion,
      },
      date: "28-05-2025",
    },
    {
      key: keyUpdate.N,
      label: "Bestie Spirit & Mount Calculator",
      link: {
        key: TAB_KEY.miscBestie,
        name: TAB_KEY.miscBestie,
      },
      date: "04-07-2025",
    },
  ];

  const dataSoon: Array<FeatureItem> = [
    {
      key: keyUpdate.P,
      label: "VIP accessories",
    },
    {
      key: keyUpdate.P,
      label: "To Do List",
    },
    {
      key: keyUpdate.P,
      label: "Future feature (beta)",
    },
    {
      key: keyUpdate.P,
      label: "Gear Info",
    },
  ];

  const dataPastFunc: Array<FeatureItem> = [
    {
      key: keyUpdate.D,
      label:
        "Equipment (Ancient, Kilos, Named EOD), Jade (Lunar, Skill, Erosion), Heraldry (Ancient Goddess), Talisman (Black Dragon, Eternal).",
      date: "Not Recorded",
    },
    {
      key: keyUpdate.D,
      label: "Dimensional Dragon Jade",
      link: {
        key: TAB_KEY.jadeSkill,
        name: TAB_KEY.jadeSkill,
      },
      date: "03-02-2025",
    },
    {
      key: keyUpdate.D,
      label: "Ancient Lunar Jade Enhancement Calculator",
      link: {
        key: TAB_KEY.jadeLunar,
        name: TAB_KEY.jadeLunar,
        payload: {
          lunarScreen: {
            tabOpen: ["4"],
          },
        },
      },
      date: "23-02-2025",
    },
    {
      key: keyUpdate.D,
      label: "Conversion Costume Calculator",
      link: {
        key: TAB_KEY.miscConversion,
        name: TAB_KEY.miscConversion,
      },
      date: "04-04-2025",
    },
    {
      key: keyUpdate.D,
      label: "Bone Dragon Armor & Weapon Calculator",
      link: {
        key: TAB_KEY.eqBoneDragon,
        name: TAB_KEY.eqBoneDragon,
      },
      date: "26-05-2025",
    },
  ];
  const dataPastUpdate: Array<FeatureItem> = [
    {
      key: keyUpdate.D,
      label:
        "Patch Note link for some existing item in Help bar (question mark in bottom right corner)",
    },
    {
      key: keyUpdate.D,
      label: "Success rate note on all of the skill jade",
    },
  ];

  return (
    <div>
      <Divider orientation="left">What's New</Divider>
      <Space direction="horizontal">
        <List bordered dataSource={dataNew} renderItem={renderItem} />
      </Space>

      {!onlyNew && (
        <>
          <Divider orientation="left">What's Next?</Divider>
          <Space direction="horizontal">
            <List bordered dataSource={dataSoon} renderItem={renderItem} />
          </Space>

          <Divider orientation="left">Release History</Divider>
          <Collapse
            items={[
              {
                key: "1",
                label: "Functionality",
                children: (
                  <Space direction="horizontal">
                    <List
                      bordered
                      dataSource={dataPastFunc}
                      renderItem={renderItem}
                    />
                  </Space>
                ),
              },
              {
                key: "2",
                label: "Update",
                children: (
                  <Space direction="horizontal">
                    <List
                      bordered
                      dataSource={dataPastUpdate}
                      renderItem={renderItem}
                    />
                  </Space>
                ),
              },
            ]}
            size="small"
          />
        </>
      )}
    </div>
  );
};

export default ReleaseNotes;
