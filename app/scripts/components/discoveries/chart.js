import React, { useEffect, useState } from 'react';
import T from 'prop-types';
import { csv, json } from 'd3-fetch';
import { ResponsiveLine } from '@nivo/line';
import { interpolatePlasma } from 'd3-scale-chromatic'; // https://github.com/d3/d3-scale-chromatic

const fileExtensionRegex = /(?:\.([^.]+))?$/;
function formatData({ data, idKey, xKey, yKey }) {
  const dataWId = data.reduce((acc, curr) => {
    if (!acc.find((e) => e.id === curr.County)) {
      const newEntry = {
        id: curr[idKey],
        data: []
      };
      acc.push(newEntry);
    }
    acc
      .find((e) => e.id === curr.County)
      .data.push({
        x: curr[xKey],
        y: curr[yKey]
      });
    return acc;
  }, []);
  return dataWId;
}

function getBottomAxis(dateFormat) {
  const tickNum = 10; // adjust per screen size
  return {
    tickValues: tickNum,
    tickSize: 5,
    tickPadding: 5,
    tickRotation: 0,
    format: dateFormat
  };
}

function getLegend() {
  return [
    {
      anchor: 'bottom-right',
      direction: 'column',
      justify: false,
      translateX: 100,
      translateY: 0,
      itemsSpacing: 0,
      itemDirection: 'left-to-right',
      itemWidth: 80,
      itemHeight: 20,
      itemOpacity: 0.75,
      symbolSize: 12,
      symbolShape: 'square',
      symbolBorderColor: 'rgba(0, 0, 0, .5)',
      effects: [
        {
          on: 'hover',
          style: {
            itemBackground: 'rgba(0, 0, 0, .03)',
            itemOpacity: 1
          }
        }
      ]
    }
  ];
}

function getColors(steps) {
  return new Array(steps).fill(0).map((e, idx) => {
    return interpolatePlasma(idx / steps);
  });
}

const Chart = ({ dataPath, idKey, xKey, yKey, dateFormat }) => {
  const [data, setData] = useState([]);
  const extension = fileExtensionRegex.exec(dataPath)[1];

  useEffect(() => {
    const getData = async () => {
      let data;
      if (extension === 'csv') data = await csv(dataPath);
      else data = await json(dataPath);
      const formattedData = formatData({ data, extension, idKey, xKey, yKey });
      setData(formattedData);
    };
    getData();
  }, [dataPath, idKey, xKey, yKey, extension]);
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ResponsiveLine
        data={data}
        margin={{ top: 50, right: 100, bottom: 50, left: 60 }}
        xScale={{
          type: 'time',
          format: dateFormat,
          precision: 'day'
        }}
        colors={getColors(data.length)}
        xFormat={`time:${dateFormat}`}
        yScale={{
          type: 'linear',
          min: 'auto',
          max: 'auto',
          stacked: true,
          reverse: false
        }}
        enableGridX={false}
        enablePoints={false}
        enableSlices='x'
        axisBottom={getBottomAxis(dateFormat)}
        legends={getLegend()}
        sliceTooltip={({ slice }) => {
          console.log(slice.points[0]);
          return (
            <div
              style={{
                background: 'white',
                padding: '9px 12px',
                border: '1px solid #ccc'
              }}
            >
              <strong>{slice?.points[0].data.xFormatted}</strong>
              {slice.points.map((point) => (
                <div
                  key={point.id}
                  style={{
                    padding: '3px 0'
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: point.serieColor,
                      display: 'inline-block',
                      marginRight: '3px'
                    }}
                  />
                  <strong>{point.serieId}</strong> : {point.data.yFormatted}
                </div>
              ))}
            </div>
          );
        }}
      />
    </div>
  );
};

Chart.propTypes = {
  dataPath: T.string,
  idKey: T.string,
  xKey: T.string,
  yKey: T.string
};

export default Chart;
