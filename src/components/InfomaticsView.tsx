import { Col, Row, Typography } from "antd";
import { FunctionComponent } from "react";
import { IChartProps } from "./ChartImplementation";

const InfomaticsView: FunctionComponent<IChartProps> = ({ datas }) => {
  return (
    <div data-testid="infomatics">
      {datas.map((data, index) =>
        data.status === "fulfilled" ? (
          <Row key={index} justify="start">
            <Col>
              <Typography.Paragraph className="" strong>
                {data.value?.key}
              </Typography.Paragraph>
            </Col>
            <Col>
              <Typography.Paragraph>
                {data.value?.data as number}
              </Typography.Paragraph>
            </Col>
          </Row>
        ) : (
          <Row key={index}>
            <Col>
              <Typography.Paragraph strong>{data.reason?.key}</Typography.Paragraph>
            </Col>
            <Col>
              <Typography.Paragraph>0</Typography.Paragraph>
            </Col>
          </Row>
        )
      )}
    </div>
  );
};

export default InfomaticsView;
