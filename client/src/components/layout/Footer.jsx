import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-100 dark:bg-gray-800 mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">{t('footer.rights')}</p>
          <p className="text-sm text-gray-500">{t('footer.description')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;