'use client';

import { Box, Divider, Typography } from '@mui/material';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import AlertasEAcoes from '../widgets/AlertasEAcoes';
import {
  clientsMakeGraphs,
  salesMakeGraphs,
  stockMakeGraphs,
} from '../helpers/CockpitHelper';
import ResumeGraph from '../widgets/ResumeGraph';
import { GraphData } from '@/utils/graphics';
import {
  useListAlertsCockipt,
  useQueryAnnualRevenues,
  useQueryCustomerAnnualRecurrence,
  useQueryCustomerQuarterlyRecurrence,
  useQueryDailyRevenues,
  useQueryMonthlyRevenues,
  useQuerySegmentationClients,
  useQueryStockMetrics,
} from '@/services/analysis/queries';
import { useQueryTotalCustomerSegmentationMetric } from '@/services/customer/queries';
import {
  useQueryAverageMonthlyDiscount,
  useQueryMonthlyGrossProfit,
  useQueryMonthlyReturnPercentage,
} from '@/services/sales/queries';

function WrapperGrid({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: '1rem',
        gridTemplateColumns: {
          xs: 'repeat(auto-fit, minmax(225px, 1fr))',
          xl: 'repeat(auto-fit, minmax(270px, 1fr))',
        },
      }}
    >
      {children}
    </Box>
  );
}
export default function CockpitPage() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const { data: customer } = useQuerySegmentationClients();
  const { data: customerQuarterlyRecurrence } =
    useQueryCustomerQuarterlyRecurrence(currentYear - 1);
  const { data: customerAnnualRecurrence } = useQueryCustomerAnnualRecurrence(
    currentYear - 2,
  );
  const { data: annualRevenues } = useQueryAnnualRevenues();
  const { data: monthlyRevenues } = useQueryMonthlyRevenues();
  const { data: currentYearDailyRevenues } = useQueryDailyRevenues(
    currentYear,
    currentMonth,
  );
  const { data: lastYearDailyRevenues } = useQueryDailyRevenues(
    currentYear - 1,
    currentMonth,
  );
  const { data: stock } = useQueryStockMetrics();
  const { data: alertsCockpit, isLoading: isLoadingAlertsCockpit } =
    useListAlertsCockipt();

  const { data: totalCustomerSegmentationMetric } =
    useQueryTotalCustomerSegmentationMetric(currentYear);

  const { data: averageMonthlyDiscount } = useQueryAverageMonthlyDiscount(
    undefined,
    currentYear,
  );
  const { data: monthlyGrossProfit } = useQueryMonthlyGrossProfit(
    undefined,
    currentYear,
  );
  const { data: monthlyReturnPercentage } = useQueryMonthlyReturnPercentage(
    undefined,
    currentYear,
  );
  const { data: averageMonthlyDiscountLastYear } =
    useQueryAverageMonthlyDiscount(undefined, currentYear - 1);
  const { data: monthlyGrossProfitLastYear } = useQueryMonthlyGrossProfit(
    undefined,
    currentYear - 1,
  );
  const { data: monthlyReturnPercentageLastYear } =
    useQueryMonthlyReturnPercentage(undefined, currentYear - 1);

  const showSales = !!(
    annualRevenues &&
    monthlyRevenues &&
    averageMonthlyDiscount &&
    monthlyGrossProfit &&
    monthlyReturnPercentage &&
    currentYearDailyRevenues &&
    lastYearDailyRevenues &&
    averageMonthlyDiscountLastYear &&
    monthlyGrossProfitLastYear &&
    monthlyReturnPercentageLastYear
  );

  const showStock = !!stock;

  const showCustomers = !!(
    customer &&
    customerQuarterlyRecurrence &&
    customerAnnualRecurrence &&
    totalCustomerSegmentationMetric
  );
  return (
    <Box
      sx={{
        display: 'flex',
        gap: '1.5rem',
        overflow: {
          xs: 'visible',
          md: 'hidden',
        },
        flexDirection: {
          xs: 'column',
          md: 'row',
        },
      }}
    >
      <Box
        sx={{
          maxWidth: {
            xs: '100%',
            md: '400px',
          },
          overflow: 'auto',
          pr: 1,
          pb: 2,
          minHeight: {
            xs: '40vh',
            md: 'initial',
          },
          maxHeight: {
            xs: '40vh',
            md: 'initial',
          },
          backgroundColor: {
            xs: '#f9f7f1',
            md: 'transparent',
          },
          borderRadius: {
            xs: '12px',
            md: '0px',
          },
        }}
      >
        <Typography variant="h6" fontWeight={'normal'} color="#3e3e3e" mb={1}>
          Alertas e Ações
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <AlertasEAcoes
          cockpitAlert={alertsCockpit}
          isLoading={isLoadingAlertsCockpit}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: {
            xs: 'visible',
            md: 'auto',
          },
          pb: 2,
          pr: 1,
        }}
      >
        <Typography variant="h6" fontWeight={'normal'} color="#3e3e3e" mb={1}>
          Resultados • KPIs
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box>
          <Typography
            fontSize={'1.1rem'}
            fontWeight={'bold'}
            color="#3e3e3e"
            mb={1}
            mt={2}
          >
            <Box component={'span'} color="#c8c4b4" mr={1}>
              •
            </Box>
            Vendas
          </Typography>

          {!showSales ? (
            <Box
              sx={{
                width: '100%',
                height: '250px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <InsightsOutlinedIcon
                sx={{
                  width: '100px',
                  height: 'auto',
                  color: '#e2c698',
                }}
              />
              <Typography color="#737064">Gerando análises...</Typography>
            </Box>
          ) : (
            <WrapperGrid>
              {salesMakeGraphs(
                annualRevenues,
                monthlyRevenues,
                currentYearDailyRevenues,
                lastYearDailyRevenues,
                averageMonthlyDiscount,
                monthlyGrossProfit,
                monthlyReturnPercentage,
                averageMonthlyDiscountLastYear,
                monthlyGrossProfitLastYear,
                monthlyReturnPercentageLastYear,
              ).map((graph, index) => (
                <ResumeGraph
                  key={`sales-resume-graph-${index}`}
                  graph={{ ...graph, index } as GraphData}
                />
              ))}
            </WrapperGrid>
          )}

          <Typography
            fontSize={'1.1rem'}
            fontWeight={'bold'}
            color="#3e3e3e"
            mb={1}
            mt={2}
          >
            <Box component={'span'} color="#c8c4b4" mr={1}>
              •
            </Box>
            Estoque
          </Typography>
          {!showStock ? (
            <Box
              sx={{
                width: '100%',
                height: '250px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <InsightsOutlinedIcon
                sx={{
                  width: '100px',
                  height: 'auto',
                  color: '#e2c698',
                }}
              />
              <Typography color="#737064">Gerando análises...</Typography>
            </Box>
          ) : (
            <WrapperGrid>
              {stockMakeGraphs(stock).map((graph, index) => (
                <ResumeGraph
                  key={`stock-resume-graph-${index}`}
                  graph={{ ...graph, index } as GraphData}
                />
              ))}
            </WrapperGrid>
          )}

          <Typography
            fontSize={'1.1rem'}
            fontWeight={'bold'}
            color="#3e3e3e"
            mb={1}
            mt={2}
          >
            <Box component={'span'} color="#c8c4b4" mr={1}>
              •
            </Box>
            Cliente
          </Typography>
          {!showCustomers ? (
            <Box
              sx={{
                width: '100%',
                height: '250px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <InsightsOutlinedIcon
                sx={{
                  width: '100px',
                  height: 'auto',
                  color: '#e2c698',
                }}
              />
              <Typography color="#737064">Gerando análises...</Typography>
            </Box>
          ) : (
            <WrapperGrid>
              {clientsMakeGraphs(
                customer,
                customerQuarterlyRecurrence,
                customerAnnualRecurrence,
                totalCustomerSegmentationMetric,
              ).map((graph, index) => (
                <ResumeGraph
                  key={`clients-resume-graph-${index}`}
                  graph={{ ...graph, index } as GraphData}
                />
              ))}
            </WrapperGrid>
          )}
        </Box>
      </Box>
    </Box>
  );
}
