var app = (function () {
    "use strict";

    /** Constants */
    var CLASS_NAME_ELEMENT_AUXILIARY = 'auxiliary',
        DATA_ATTR_CHAPTER_BODY = 'data-chapter-body',
        CLASS_NAME_ELEMENT_PAGE = 'page',
        CLASS_NAME_ELEMENT_PAGES = 'pages',
        ID_ELEMENT_AUXILIARY = 'auxiliary',
        ID_ELEMENT_HTML_DATA = 'htmlData',
        ID_ELEMENT_PAGES = 'pages',
        DATA_ATTR_CHAPTER_INDEX = 'data-chapter-index',
        DATA_ATTR_PAGE_INDEX = 'data-page-index',
        SELECTOR_CHAPTER_TITLE = 'h1',
        SELECTOR_SECTION_START = 'h2',
        REPLACE_NAME_PAGE_CONTENT = '%pageContent%';

    var $auxiliaryBodies,
        pageIndexAttr = 1;

    /**
     * Inserting page into list of pages
     * */
    var insertPage = function (pageBody, chapterIndexAttr) {
        var $pages = document.getElementById(ID_ELEMENT_PAGES),
            page = document.createElement('section');

        page.className = CLASS_NAME_ELEMENT_PAGE;
        page.setAttribute(DATA_ATTR_PAGE_INDEX, pageIndexAttr);
        page.setAttribute(DATA_ATTR_CHAPTER_INDEX, chapterIndexAttr);

        var pageBodyToString = '';

        pageBody.forEach(function (item) {
            pageBodyToString += item.element.outerHTML;
        });
        page.innerHTML = pageBodyToString;

        $pages.appendChild(page);

        pageIndexAttr++;
    };

    /**
     * Build list of pages
     * */
    var buildList = function () {
        var allElements = [];

        Array.prototype.forEach.call($auxiliaryBodies, function (item, index) {
            var $itemChildren = item.children;

            Array.prototype.forEach.call($itemChildren, function (subitem) {
                allElements.push({
                    element: subitem,
                    chapterIndex: index
                });
            });
        });

        var allElementsLength = allElements.length,
            left = 0,
            lastIndex = 0,
            lastChapterIndex = 0;

        allElements.forEach(function (item, index) {
            var offsetLeft = item.element.offsetLeft,
                page;

            if (offsetLeft !== left || lastChapterIndex !== item.chapterIndex) {
                page = allElements.slice(lastIndex, index);

                insertPage(page, allElements[index - 1].chapterIndex + 1);

                left = offsetLeft;
                lastIndex = index;
                lastChapterIndex = item.chapterIndex;
            }

            if (index === allElementsLength - 1) {
                page = allElements.slice(lastIndex);

                insertPage(page, item.chapterIndex + 1);
            }
        });
    };

    /**
     * Removing supporting section which is no longer needed
     * */
    var removeSupportingSection = function () {
        var $auxiliary = document.getElementById(ID_ELEMENT_AUXILIARY),
            $htmldata = document.getElementById(ID_ELEMENT_HTML_DATA);

        document.body.removeChild($auxiliary);
        document.body.removeChild($htmldata);
    };

    /**
     * Build start html
     * */
    var buildStartHtml = function () {
        /** Section auxiliary */
        var sectionAuxiliary = document.createElement('section');
        sectionAuxiliary.id = ID_ELEMENT_AUXILIARY;
        sectionAuxiliary.className = CLASS_NAME_ELEMENT_AUXILIARY;

        document.body.appendChild(sectionAuxiliary);

        /** Pages */
        var pages = document.createElement('article');
        pages.id = ID_ELEMENT_PAGES;
        pages.className = CLASS_NAME_ELEMENT_PAGES;

        document.body.appendChild(pages);
    };

    /**
     * Send config
     * */
    var sendConfig = function (config) {
        console.log(config);
    };

    /**
     * Create config
     * */
    var createConfig =  function () {
        var $pages = document.querySelectorAll('.' + CLASS_NAME_ELEMENT_PAGE),
            $chapters = document.querySelectorAll('[' + DATA_ATTR_CHAPTER_INDEX + ']'),
            lastTagIndex = 0,
            lastPageIndex = 0,
            startTagIndex = 0,
            lastChapterIndex = 0,
            sectionOrder = 1,
            headerDocument = '<!DOCTYPE html><html>' + document.head.outerHTML + '<body>' + REPLACE_NAME_PAGE_CONTENT + '</body></html>';

        var config = {
            pages: [],
            chapters: []
        };

        Array.prototype.forEach.call($pages, function (item) {
            var $pageElements = item.children,
                pageIndex = +item.getAttribute(DATA_ATTR_PAGE_INDEX),
                chapterOrder = +item.getAttribute(DATA_ATTR_CHAPTER_INDEX),
                sections = [],
                pageInnerHTML = item.outerHTML,
                pageInnerText = item.innerText;

            Array.prototype.forEach.call($pageElements, function (subitem) {
                if (lastPageIndex !== pageIndex) {
                    startTagIndex = lastTagIndex;

                    lastPageIndex = pageIndex;
                }

                lastTagIndex++;

                if (subitem.matches(SELECTOR_SECTION_START)) {
                    var configSection = {
                        sectionOrder: sectionOrder,
                        title: subitem.textContent,
                        offsetTop: subitem.offsetTop,
                        page: +item.getAttribute(DATA_ATTR_PAGE_INDEX)
                    };

                    sections.push(configSection);

                    sectionOrder++;
                }
            });

            var configPages = {
                pageNumber: pageIndex,
                tagIndex: startTagIndex,
                chapterOrder: chapterOrder,
                outerHTML: headerDocument.replace(REPLACE_NAME_PAGE_CONTENT, pageInnerHTML),
                innerText: pageInnerText,
                sections: sections
            };

            config.pages.push(configPages);
        });

        Array.prototype.forEach.call($chapters, function (item) {
            var chapterIndex = +item.getAttribute(DATA_ATTR_CHAPTER_INDEX),
                pageIndex = +item.getAttribute(DATA_ATTR_PAGE_INDEX),
                chapterTitle;

            if (lastChapterIndex !== chapterIndex) {
                var $chapterPages = document.querySelectorAll('[' + DATA_ATTR_CHAPTER_INDEX + '="' + chapterIndex + '"]'),
                    sections = [],
                    sectionOrder = 1;

                Array.prototype.forEach.call($chapterPages, function (subitem) {
                    var $titleElement = subitem.querySelector(SELECTOR_CHAPTER_TITLE),
                        $sections = subitem.querySelectorAll(SELECTOR_SECTION_START);

                    if ($titleElement) {
                        chapterTitle = $titleElement.textContent;
                    }

                    Array.prototype.forEach.call($sections, function (sectionItem) {
                        if ($sections.length) {
                            var configSection = {
                                sectionOrder: sectionOrder,
                                offsetTop: sectionItem.offsetTop,
                                title: sectionItem.textContent,
                                page: +subitem.getAttribute(DATA_ATTR_PAGE_INDEX)
                            };

                            sections.push(configSection);

                            sectionOrder++;
                        }
                    });
                });

                var configChapters = {
                    title: chapterTitle,
                    page: pageIndex,
                    orderNumber: chapterIndex,
                    sections: sections
                };

                config.chapters.push(configChapters);

                lastChapterIndex = chapterIndex;
            }
        });

        var configToJson = JSON.stringify(config);

        sendConfig(configToJson);
    };

    /**
     * Start building
     * */
    var startBuilding = function (data) {
        document.getElementById(ID_ELEMENT_AUXILIARY).innerHTML = data;
        $auxiliaryBodies = document.getElementById(ID_ELEMENT_AUXILIARY).querySelectorAll('[' + DATA_ATTR_CHAPTER_BODY + ']');

        /**
         * Order of execution is important here
         * */
        buildList();
        removeSupportingSection();
        createConfig();
    };

    /**
     * Get html data
     * */
    var getData = function () {
        var htmlData = document.getElementById(ID_ELEMENT_HTML_DATA).innerHTML;

        startBuilding(htmlData);
    };

    return {
        /**
         * Initialization
         * */
        init: function() {
            buildStartHtml();
            getData();
        }

    };
})();

/**
 * Document load
 * */
window.onload = app.init;