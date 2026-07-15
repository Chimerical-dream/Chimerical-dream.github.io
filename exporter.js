(() => {
    const downloadButtons = document.querySelectorAll('.pdf-download');
    const pageMargin = 18;
    const lineHeight = 5;

    function addPage(pdf) {
        pdf.addPage();
        return pageMargin;
    }

    function ensureSpace(pdf, y, height) {
        const pageHeight = pdf.internal.pageSize.getHeight();
        return y + height > pageHeight - pageMargin ? addPage(pdf) : y;
    }

    function writeText(pdf, text, x, y, options = {}) {
        const maxWidth = options.maxWidth || pdf.internal.pageSize.getWidth() - pageMargin * 2;
        const lines = pdf.splitTextToSize(text, maxWidth);
        y = ensureSpace(pdf, y, lines.length * lineHeight + 2);
        pdf.text(lines, x, y);
        return y + lines.length * lineHeight;
    }

    function writeGame(pdf, game, y) {
        const pageWidth = pdf.internal.pageSize.getWidth();
        const contentWidth = pageWidth - pageMargin * 2;

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        y = writeText(pdf, game.Title, pageMargin, y, { maxWidth: contentWidth });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9.5);
        y = writeText(pdf, game.Description, pageMargin, y + 1, { maxWidth: contentWidth });

        const details = [
            game.TimePeriod,
            (game.Skills || []).join('  -  ')
        ].filter(Boolean).join('\n');
        if (details) {
            pdf.setTextColor(70, 98, 143);
            y = writeText(pdf, details, pageMargin, y + 1, { maxWidth: contentWidth });
            pdf.setTextColor(0, 0, 0);
        }

        const links = [
            ['Video', game.YoutubeLink],
            ['Play', game.PlayLink],
            ['AppMagic', game.AppMagicLink],
            ['Repository', game.RepositoryLink]
        ].filter(([, link]) => link).map(([label, link]) => `${label}: ${link}`).join('\n');

        if (links) {
            pdf.setTextColor(20, 80, 145);
            y = writeText(pdf, links, pageMargin, y + 1, { maxWidth: contentWidth });
            pdf.setTextColor(0, 0, 0);
        }

        return y + 7;
    }

    function exportPortfolioAsPdf() {
        if (!window.jspdf || typeof portfolioData === 'undefined') {
            throw new Error('Portfolio PDF data is unavailable.');
        }

        const data = portfolioData;
        downloadButtons.forEach(button => {
            button.disabled = true;
            button.querySelector('i').className = 'fas fa-spinner fa-spin';
        });

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            let y = pageMargin;

            pdf.setProperties({ title: 'Dmitry Sudarev Portfolio', author: 'Dmitry Sudarev' });
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(22);
            pdf.text('Dmitry Sudarev', pageMargin, y);
            y += 10;
            pdf.setFontSize(13);
            pdf.text('Game Development Portfolio', pageMargin, y);
            y += 12;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            y = writeText(pdf, `Core skills: ${data.Skills.join(' - ')}`, pageMargin, y, { maxWidth: pageWidth - pageMargin * 2 });
            y += 8;

            data.Companies.forEach(company => {
                y = ensureSpace(pdf, y, 17);
                pdf.setDrawColor(157, 181, 255);
                pdf.line(pageMargin, y, pageWidth - pageMargin, y);
                y += 7;
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(16);
                y = writeText(pdf, company.Title, pageMargin, y, { maxWidth: pageWidth - pageMargin * 2 });

                pdf.setFont('helvetica', 'normal');
                pdf.setFontSize(10);
                const companyDetails = [
                    company.TimePeriod,
                    (company.Skills || []).join('  -  ')
                ].filter(Boolean).join('\n');
                if (companyDetails) {
                    pdf.setTextColor(70, 98, 143);
                    y = writeText(pdf, companyDetails, pageMargin, y + 1, { maxWidth: pageWidth - pageMargin * 2 });
                    pdf.setTextColor(0, 0, 0);
                }
                y += 5;

                company.Games.forEach(game => {
                    y = writeGame(pdf, game, y);
                });
            });

            const pageCount = pdf.getNumberOfPages();
            for (let page = 1; page <= pageCount; page += 1) {
                pdf.setPage(page);
                pdf.setFontSize(8);
                pdf.setTextColor(100, 100, 100);
                pdf.text(`Page ${page} of ${pageCount}`, pageWidth - pageMargin, pdf.internal.pageSize.getHeight() - 8, { align: 'right' });
            }
            pdf.save('dmitry-sudarev-portfolio.pdf');
        } finally {
            downloadButtons.forEach(button => {
                button.disabled = false;
                button.querySelector('i').className = 'fas fa-file-pdf';
            });
        }
    }

    downloadButtons.forEach(downloadButton => downloadButton.addEventListener('click', () => {
        try {
            exportPortfolioAsPdf();
        } catch (error) {
            console.error('Unable to export PDF:', error);
            alert('Unable to export the PDF. Please try again.');
        }
    }));
})();
