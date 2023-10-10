import { Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { CharacterInGameData } from "../../interface/Account.interface";
import { exampleAccount } from "../../mocks/example.mock";
const { Text } = Typography;
const GeneralContent = () => {
  interface DataType {
    key: string;
    name: string;
    age: number;
    address: string;
    tags: string[];
  }

  const columns: ColumnsType<CharacterInGameData> = [
    {
      title: "Name",
      dataIndex: "ign",
      //   key: "ign",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Job",
      dataIndex: "job",
    },
    {
      title: "Level",
      dataIndex: "level",
    },
    {
      title: "STG",
      dataIndex: "stg",
    },
    {
      title: "Skill Jade",
      dataIndex: "skillJade",
      //   key: "ign",
      render: (_, { skillJade }) => (
        <Text>
          {skillJade?.map((item) => `${item.name}(${item.level})`).toString()}
        </Text>
      ),
    },

    // {
    //   title: "Tags",
    //   key: "tags",
    //   dataIndex: "tags",
    //   render: (_, { tags }) => (
    //     <>
    //       {tags.map((tag) => {
    //         let color = tag.length > 5 ? "geekblue" : "green";
    //         if (tag === "loser") {
    //           color = "volcano";
    //         }
    //         return (
    //           <Tag color={color} key={tag}>
    //             {tag.toUpperCase()}
    //           </Tag>
    //         );
    //       })}
    //     </>
    //   ),
    // },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, record) => (
    //     <Space size="middle">
    //       <a>Invite {record.name}</a>
    //       <a>Delete</a>
    //     </Space>
    //   ),
    // },
  ];

  return <Table
    columns={columns}
    // dataSource={exampleAccount.characters}
    dataSource={[]}
  />
};

export default GeneralContent;
