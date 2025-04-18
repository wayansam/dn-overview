import { useEffect, useMemo, useState } from "react";
import EquipmentTable, {
  EquipmentTableCalculator,
} from "../../components/EquipmentTable";
import { BoneCalculator } from "../../interface/Common.interface";
import { dataBoneCalculator } from "../../data/BoneDragonEqData";

const BoneDragonEqContent = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] =
    useState<BoneCalculator[]>(dataBoneCalculator);
  const [selectFrom, setSelectFrom] = useState<number>(0);
  const [selectTo, setSelectTo] = useState<number>(1);

  const invalidDtSrc = useMemo(() => {
    let flag = false;
    selectedRowKeys.forEach((item) => {
      const found = dataSource.find((dt) => dt.key === item);
      if (!flag && found) {
        if (found.to <= found.from) {
          flag = true;
        }
      }
    });
    return flag;
  }, [selectedRowKeys, dataSource]);

  useEffect(() => {
    const newData = dataSource.map((item) => ({
      ...item,
      from: selectFrom,
      to: selectTo,
    }));
    setDataSource(newData);
  }, [selectFrom, selectTo]);

  return (
    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
      <div style={{ marginRight: 10, marginBottom: 10, overflowX: "auto" }}>
        <EquipmentTable
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
          dataSource={dataSource}
          setDataSource={setDataSource}
        />
      </div>
    </div>
  );
};

export default BoneDragonEqContent;
