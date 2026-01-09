'use client';

import { Box, Divider, Typography } from '@mui/material';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import AlertasEAcoes from '../widgets/AlertasEAcoes';
import { useEffect, useState } from 'react';
import {
  analysisService,
  CustomerAnnualRecurrence,
  CustomerQuarterlyRecurrence,
  CustomerSegmentation,
} from '@/services/analysis/analysisService';
import {
  clientsMakeGraphs,
  salesMakeGraphs,
  stockMakeGraphs,
} from '../helpers/CockpitHelper';
import ResumeGraph from '../widgets/ResumeGraph';
import { GraphData } from '@/utils/graphics';
import { useListAlertsCockipt } from '@/services/analysis/queries';

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
  const [customer, setCustomer] = useState<CustomerSegmentation[]>([]);
  const [customerQuarterlyRecurrence, setCustomerQuarterlyRecurrence] =
    useState<CustomerQuarterlyRecurrence[]>([]);
  const [customerAnnualRecurrence, setCustomerAnnualRecurrence] = useState<
    CustomerAnnualRecurrence[]
  >([]);
  const [annualRevenues, setAnnualRevenues] = useState<any[]>([]);
  const [monthlyRevenues, setMonthlyRevenues] = useState<any[]>([]);
  const [currentYearDailyRevenues, setCurrentYearDailyRevenues] = useState<
    any[]
  >([]);
  const [lastYearDailyRevenues, setLastYearDailyRevenues] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const { data: alertsCockpit, isLoading: isLoadingAlertsCockpit } =
    useListAlertsCockipt();

  useEffect(() => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    analysisService
      .getSegmentacaoClientes()
      .then(setCustomer)
      .catch(console.error);

    analysisService
      .getCustomerQuarterlyRecurrence(currentYear - 1)
      .then(setCustomerQuarterlyRecurrence)
      .catch(console.error);
    analysisService
      .getCustomerAnnualRecurrence(currentYear - 2)
      .then(setCustomerAnnualRecurrence)
      .catch(console.error);

    analysisService
      .getAnnualRevenues()
      .then(setAnnualRevenues)
      .catch(console.error);

    analysisService
      .getMonthlyRevenues()
      .then(setMonthlyRevenues)
      .catch(console.error);

    analysisService
      .getDailyRevenues(currentYear, new Date().getMonth() + 1)
      .then(setCurrentYearDailyRevenues)
      .catch(console.error);

    // analysisService.getDailyRevenues((new Date()).getFullYear() - 1, (new Date()).getMonth()) // TODO: Wait for API to populate last year data
    analysisService
      .getDailyRevenues(currentMonth===1? currentYear - 1 : currentYear, currentMonth===1? 12 : currentMonth - 1)
      .then(setLastYearDailyRevenues)
      .catch(console.error);

    analysisService.getStockMetrics().then(setStock).catch(console.error);
  }, []);

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

          {!annualRevenues &&
          !monthlyRevenues &&
          !currentYearDailyRevenues &&
          !lastYearDailyRevenues ? (
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
              {annualRevenues &&
                monthlyRevenues &&
                salesMakeGraphs(
                  annualRevenues,
                  monthlyRevenues,
                  currentYearDailyRevenues,
                  lastYearDailyRevenues,
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
          {!stock ? (
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
              {stock &&
                stockMakeGraphs(stock).map((graph, index) => (
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
          {!customer ? (
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
              {customer &&
                customerQuarterlyRecurrence &&
                customerAnnualRecurrence &&
                clientsMakeGraphs(
                  customer,
                  customerQuarterlyRecurrence,
                  customerAnnualRecurrence,
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
