import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  IconButton,
  Collapse,
  Paper,
  Tooltip as MuiTooltip
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  Legend,
  TooltipProps,
  ReferenceLine,
  Area,
  AreaChart
} from 'recharts';
import { format, addMinutes, isWithinInterval, min, max, subMinutes } from 'date-fns';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoIcon from '@mui/icons-material/Info';

interface LogData {
  timestamp: Date;
  message: string;
  file: string;
  level: 'ERR' | 'WRN';
}

interface TimelineProps {
  logData: LogData[];
  selectedError: string | null;
}

interface ChartDataPoint {
  timestamp: Date;
  errorCount: number;
  warningCount: number;
  totalCount: number;
  entries?: LogData[];
}

interface ScatterDataPoint extends ChartDataPoint {
  file: string;
  level: 'ERR' | 'WRN';
}

const Timeline: React.FC<TimelineProps> = ({ logData, selectedError }) => {
  const theme = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);

  // Calculate the date range once
  const { startDate, endDate } = useMemo(() => {
    if (!logData.length) return { startDate: new Date(), endDate: new Date() };

    const dates = logData.map(log => log.timestamp);
    const minDate = min(dates);
    const maxDate = max(dates);

    // Add 30-minute padding before first and after last entry
    return {
      startDate: subMinutes(minDate, 30),
      endDate: addMinutes(maxDate, 30)
    };
  }, [logData]);

  // Process data for the chart
  const chartData = useMemo(() => {
    if (!logData.length) return [];

    // Filter data if an error is selected
    const filteredData = selectedError
      ? logData.filter(log => log.message === selectedError)
      : logData;

    // Create 15-minute intervals
    const intervals: ChartDataPoint[] = [];
    let currentInterval = startDate;

    while (currentInterval <= endDate) {
      intervals.push({
        timestamp: new Date(currentInterval),
        errorCount: 0,
        warningCount: 0,
        totalCount: 0,
        entries: []
      });
      currentInterval = addMinutes(currentInterval, 15);
    }

    // Count occurrences and collect entries for each interval
    filteredData.forEach(log => {
      const interval = intervals.find(i => 
        isWithinInterval(log.timestamp, {
          start: i.timestamp,
          end: addMinutes(i.timestamp, 15)
        })
      );
      if (interval) {
        if (log.level === 'ERR') {
          interval.errorCount++;
        } else {
          interval.warningCount++;
        }
        interval.totalCount = interval.errorCount + interval.warningCount;
        interval.entries?.push(log);
      }
    });

    return intervals;
  }, [logData, selectedError, startDate, endDate]);

  const formatXAxis = (date: Date) => {
    return format(date, 'MMM d HH:mm');
  };

  const formatTooltip = (date: Date) => {
    return format(date, 'MMMM d, yyyy HH:mm:ss.SSS');
  };

  const renderTooltip = (props: TooltipProps<number, string>) => {
    if (!props.active || !props.payload || props.payload.length === 0) {
      return null;
    }

    const data = props.payload[0].payload as ChartDataPoint | ScatterDataPoint;
    const isScatterPoint = 'file' in data;

    return (
      <Paper elevation={3} sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle2" gutterBottom>
          {formatTooltip(data.timestamp)}
        </Typography>
        {isScatterPoint ? (
          <>
            <Typography variant="body2" color={data.level === 'ERR' ? 'error' : 'warning'}>
              {data.level === 'ERR' ? 'Error' : 'Warning'}
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="body2" color="error">
              Errors: {data.errorCount}
            </Typography>
            <Typography variant="body2" color="warning">
              Warnings: {data.warningCount}
            </Typography>
          </>
        )}
      </Paper>
    );
  };

  // Create scatter plot data
  const scatterData = useMemo(() => {
    if (!selectedError) return [];
    
    return chartData.flatMap(interval => 
      (interval.entries || []).map(entry => ({
        timestamp: entry.timestamp,
        errorCount: entry.level === 'ERR' ? 1 : 0,
        warningCount: entry.level === 'WRN' ? 1 : 0,
        totalCount: 1,
        file: entry.file,
        level: entry.level
      }))
    );
  }, [chartData, selectedError]);

  // Calculate Y-axis domain
  const yAxisDomain = useMemo(() => {
    const maxCount = Math.max(...chartData.map(d => d.totalCount));
    return [0, Math.max(maxCount, 1)];
  }, [chartData]);

  const getTitle = () => {
    if (!logData.length) return 'Timeline';
    return 'Error and Warning Timeline';
  };

  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">
            {getTitle()}
          </Typography>
          <MuiTooltip title="Shows error and warning occurrences over time. Hover over points for details.">
            <InfoIcon fontSize="small" color="action" />
          </MuiTooltip>
        </Box>
        <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={!isCollapsed}>
        <Box sx={{ height: 400, width: '100%' }}>
          <ResponsiveContainer>
            <AreaChart
              data={chartData}
              margin={{
                top: 16,
                right: 16,
                bottom: 24,
                left: 24,
              }}
              onMouseMove={(e) => {
                if (e.activePayload) {
                  setHoveredPoint(e.activePayload[0].payload as ChartDataPoint);
                }
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                domain={[startDate.getTime(), endDate.getTime()]}
                type="number"
                scale="time"
                tickFormatter={formatXAxis}
                interval="preserveStartEnd"
                minTickGap={50}
                padding={{ left: 0, right: 0 }}
              />
              <YAxis
                domain={yAxisDomain}
                allowDecimals={false}
              />
              <Tooltip content={renderTooltip} />
              <Legend />
              <Area
                type="monotone"
                dataKey="errorCount"
                name="Errors"
                stackId="1"
                stroke={theme.palette.error.main}
                fill={theme.palette.error.main}
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="warningCount"
                name="Warnings"
                stackId="1"
                stroke={theme.palette.warning.main}
                fill={theme.palette.warning.main}
                fillOpacity={0.3}
              />
              {selectedError && (
                <Scatter
                  data={scatterData}
                  dataKey="totalCount"
                  name="Individual Occurrences"
                  fill={theme.palette.error.main}
                  shape="circle"
                  legendType="circle"
                />
              )}
              {hoveredPoint && (
                <ReferenceLine
                  x={hoveredPoint.timestamp.getTime()}
                  stroke={theme.palette.text.secondary}
                  strokeDasharray="3 3"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default Timeline; 