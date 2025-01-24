import React, { useEffect, useState } from 'react';
import { DatePicker, Select, Checkbox, Row, Col, Flex } from 'antd';
import dayjs from 'dayjs';
import Chart from './Chart';

interface HospitalData {
  [key: string]: number | string;
}

interface HospitalGroup {
  全院: HospitalData;
  本部: HospitalData;
  常营院区: HospitalData;
  石景山院区: HospitalData;
}

interface DataRecord {
  日期: string;
  医院数据: HospitalGroup;
}

export default function ChartContainer() {
  const [allData, setAllData] = useState<DataRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<string>('');
  const [chartType, setChartType] = useState<string>('line');
  const [selectedHospitals, setSelectedHospitals] = useState<string[]>([
    '全院',
    '本部',
    '常营院区',
    '石景山院区',
  ]);
  const [metricsOptions, setMetricsOptions] = useState<string[]>([]);

  useEffect(() => {
    fetch('/data.json')
      .then((res) => res.json())
      .then((jsonData) => {
        const rawData: DataRecord[] = jsonData?.['数据记录'] ?? [];
        setAllData(rawData);

        if (rawData.length > 0) {
          const sampleKeys = Object.keys(rawData[0].医院数据.全院);
          setMetricsOptions(
            sampleKeys.filter((key) => key !== '当月截止总收入')
          );
          setSelectedMetric(sampleKeys[0]);
        }
        if (rawData.length > 0) {
          setSelectedDate(rawData[0].日期);
        }
      })
      .catch((err) => {
        console.error('获取 data.json 失败：', err);
      });
  }, []);

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    if (date) {
      setSelectedDate(date.format('YYYY-MM-DD'));
    }
  };

  const handleMetricChange = (value: string) => {
    setSelectedMetric(value);
  };

  const handleChartTypeChange = (value: string) => {
    setChartType(value);
  };

  const handleHospitalChange = (checkedValues: any[]) => {
    setSelectedHospitals(checkedValues as string[]);
  };

  return (
    <div className="chart-container">
      <div className="controls">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8} md={8} lg={8}>
            <Flex justify="start" align="center">
              <p>日期选择：</p>
              <DatePicker
                placeholder="选择日期"
                value={selectedDate ? dayjs(selectedDate) : null}
                onChange={handleDateChange}
              />
            </Flex>
          </Col>
          <Col xs={24} sm={8} md={8} lg={8}>
            <Flex justify="start" align="center">
              <p>分类选择：</p>
              <Select
                className="select-width"
                placeholder="选择数据分类"
                options={metricsOptions.map((metric) => ({
                  label: metric,
                  value: metric,
                }))}
                value={selectedMetric}
                onChange={handleMetricChange}
              />
            </Flex>
          </Col>
          <Col xs={24} sm={8} md={8} lg={8}>
            <Flex justify="start" align="center">
              <p>图表选择：</p>
              <Select
                className="select-width"
                placeholder="图表类型"
                options={[
                  { label: '折线图', value: 'line' },
                  { label: '柱状图', value: 'bar' },
                  { label: '饼图', value: 'pie' },
                ]}
                value={chartType}
                onChange={handleChartTypeChange}
              />
            </Flex>
          </Col>
        </Row>

        <Checkbox.Group
          options={['全院', '本部', '常营院区', '石景山院区']}
          value={selectedHospitals}
          onChange={handleHospitalChange}
        />
      </div>
      <Chart
        selectedDate={selectedDate}
        selectedMetric={selectedMetric}
        chartType={chartType}
        selectedHospitals={selectedHospitals}
        allData={allData}
      />
    </div>
  );
}
