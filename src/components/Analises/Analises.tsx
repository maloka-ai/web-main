// app/components/Analises/Analises.tsx
'use client';

import {useState} from 'react';
import {Box} from '@mui/material';
import {AnalysisSubPages} from '@/utils/enums';
import {getString} from '@/utils/strings';

import HeaderAnalises from './HeaderAnalises';
import CockpitPage from './subpages/CockpitPage';
import CustomerMoreLessActivePage from './subpages/CustomerMoreLessActivePage';
import StockReplenishmentPage from "@/components/Analises/subpages/stock-management/StockReplenishmentPage";

const CustomersSubpages = {
    [AnalysisSubPages.CUSTOMERS_MORE_OR_LESS_ACTIVE]: {
        content: <CustomerMoreLessActivePage />,
        title: getString("analysis-customers-more-or-less-active-customers"),
    },
    [AnalysisSubPages.CUSTOMERS_PROBABILITY_OF_RETURN]: {
        content: <div>Em construção</div>,
        title: getString("analysis-customers-probability-of-return"),
    },
    [AnalysisSubPages.CUSTOMERS_RECURRING_PURCHASE]: {
        content: <div>Em construção</div>,
        title: getString("analysis-customers-recurring-purchase"),
    },
    [AnalysisSubPages.CUSTOMERS_ANNUAL_RETENTION]: {
        content: <div>Em construção</div>,
        title: getString("analysis-customers-annual-retention"),
    },
    [AnalysisSubPages.CUSTOMERS_BUSINESS_GROWTH]: {
        content: <div>Em construção</div>,
        title: getString("analysis-customers-business-growth"),
    },
};

const InventoryManagementSubpages = {
    [AnalysisSubPages.STOCK_REPLENISHMENT]: {
        content: <StockReplenishmentPage />,
        title: getString("analysis-stock-replenishment"),
    },
    [AnalysisSubPages.STOCK_INACTIVE_ANALYSIS]: {
        content: <div>Em construção</div>,
        title: getString("analysis-stock-inactive"),
    },
    [AnalysisSubPages.STOCK_SKU_ANALYSIS]: {
        content: <div>Em construção</div>,
        title: getString("analysis-stock-sku-analysis"),
    },
};

export const AnalysisSubpagesConfig = {
    [AnalysisSubPages.COCKPIT]: {
        content: <CockpitPage />,
        title: getString("analysis-cockpit-title"),
    },
    ...CustomersSubpages,
    ...InventoryManagementSubpages,
};

export const AnalisysMenuConfig = [
    {
        title: getString("analysis-panel-title"),
        items: [AnalysisSubPages.COCKPIT].map((page) => ({
            title: AnalysisSubpagesConfig[page].title,
            page,
        })),
    },
    {
        title: getString("analysis-know-your-customer-title"),
        items: [
            AnalysisSubPages.CUSTOMERS_MORE_OR_LESS_ACTIVE,
            AnalysisSubPages.CUSTOMERS_PROBABILITY_OF_RETURN,
            AnalysisSubPages.CUSTOMERS_RECURRING_PURCHASE,
            AnalysisSubPages.CUSTOMERS_ANNUAL_RETENTION,
            AnalysisSubPages.CUSTOMERS_BUSINESS_GROWTH,
        ].map((page) => ({
            title: AnalysisSubpagesConfig[page].title,
            page,
        })),
    },
    {
        title: getString("analysis-stock-management-title"),
        items: [
            AnalysisSubPages.STOCK_REPLENISHMENT,
            AnalysisSubPages.STOCK_INACTIVE_ANALYSIS,
            AnalysisSubPages.STOCK_SKU_ANALYSIS,
        ].map((page) => ({
            title: AnalysisSubpagesConfig[page].title,
            page,
        })),
    },
];

export default function Analises() {
  const [activePage, setActivePage] = useState<AnalysisSubPages>(AnalysisSubPages.COCKPIT);
  const [activeMenu, setActiveMenu] = useState<string>(AnalisysMenuConfig[0].title);

  const handleNavigate = (page: AnalysisSubPages, menu: string) => {
    setActivePage(page);
    setActiveMenu(menu);
  };

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <HeaderAnalises current={activePage} menu={activeMenu} onNavigate={handleNavigate} />
      <Box sx={{ padding: '1rem', overflowY: 'auto', height: 'calc(100% - 60px)' }}>
        {AnalysisSubpagesConfig[activePage].content}
      </Box>
    </Box>
  );
}
