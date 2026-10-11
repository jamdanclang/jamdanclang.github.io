/* Shared navigation uses the existing page titles; no content is fetched or changed. */
(function portfolioNavigation() {
    var sidebar = document.getElementById('sidebar');
    if (!sidebar) return;
    var content = sidebar.querySelector('.sidebar-content');
    var primaryMenu = sidebar.querySelector('.sidebar-menu');
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var projects = [
        ['commdesign.html', 'University of Nebraska'],
        ['doane.html', 'Doane University'],
        ['telesisdetail.html', 'Telesis, Inc.'],
        ['twitchdetail.html', "An Advertiser's Guide to Twitch"],
        ['nsacdetail.html', 'National Student Advertising Competitions (NSAC): Snapple Campaign'],
        ['swedendetail.html', "Sweden's Refugee Crisis"],
        ['createdetail.html', 'Just For Fun'],
        ['bosrdetail.html', 'The Bureau of Sociological Research'],
        ['bbdetail.html', 'Bootleg Brewers'],
        ['cojmcdetail.html', 'Student Designer: CoJMC'],
        ['onetakedetail.html', 'One Take Wednesdays'],
        ['sabdetail.html', 'Student Advisory Board'],
        ['dadetail.html', 'Date Auction'],
        ['uhdetail.html', 'University Housing'],
        ['bikedetail.html', 'The Motorbike'],
        ['plandetail.html', 'Four Year Plans'],
        ['visdetail.html', 'Visual Communications (JOMC 131, 132 and 133)'],
        ['bia.html', 'Nebraska BIA Impact Explorer'],
        ['japanese.html', 'basic-japanese-flashcards.html'],
        ['jamdan.html', 'Jamdan Clang']
    ];
    sidebar.setAttribute('role', 'navigation');
    sidebar.setAttribute('aria-label', 'Portfolio navigation');
    sidebar.querySelectorAll('.social a').forEach(function (link) {
        var label = link.classList.contains('email') ? 'Email' :
            link.classList.contains('instagram') ? 'Instagram' :
            link.classList.contains('facebook') ? 'Facebook' :
            link.classList.contains('twitter') ? 'Twitter' : link.title;
        if (!label) return;
        link.textContent = label;
        var arrow = document.createElement('span');
        arrow.className = 'social-link-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = ' \u2192';
        link.appendChild(arrow);
    });
    primaryMenu.querySelectorAll('li').forEach(function (item) {
        var link = item.querySelector('a');
        var active = link.getAttribute('href') === currentPage;
        item.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'page');
    });
    var heading = document.createElement('h2');
    heading.className = 'projects-heading';
    heading.id = 'projects-heading';
    heading.textContent = 'Projects';
    var list = document.createElement('ul');
    list.className = 'sidebar-menu project-menu';
    list.setAttribute('aria-labelledby', heading.id);
    function folderIcon() {
        var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('class', 'project-folder');
        icon.setAttribute('aria-hidden', 'true');
        icon.setAttribute('focusable', 'false');
        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M3 7V5.5A1.5 1.5 0 0 1 4.5 4H9l2 3h8.5A1.5 1.5 0 0 1 21 8.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5V7Zm0 3h18');
        icon.appendChild(path);
        return icon;
    }
    var professional = ['telesisdetail.html', 'bbdetail.html', 'bosrdetail.html', 'nsacdetail.html', 'cojmcdetail.html', 'uhdetail.html'];
    var academic = ['commdesign.html', 'doane.html', 'twitchdetail.html', 'swedendetail.html', 'sabdetail.html'];
    var groups = [
        { title: 'Professional', pages: professional },
        { title: 'Academic', pages: academic },
        { title: 'Fun', pages: projects.map(function (project) { return project[0]; }).filter(function (page) {
            return professional.indexOf(page) === -1 && academic.indexOf(page) === -1;
        }) }
    ];
    groups.forEach(function (group) {
        var groupItem = document.createElement('li');
        groupItem.className = 'project-group';
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'project-group-toggle';
        button.setAttribute('aria-expanded', 'false');
        var childList = document.createElement('ul');
        childList.id = 'projects-' + group.title.toLowerCase();
        childList.className = 'sidebar-menu project-pages';
        childList.hidden = true;
        button.setAttribute('aria-controls', childList.id);
        button.appendChild(folderIcon());
        var groupLabel = document.createElement('span');
        groupLabel.textContent = group.title;
        button.appendChild(groupLabel);
        var chevron = document.createElement('span');
        chevron.className = 'project-chevron';
        chevron.setAttribute('aria-hidden', 'true');
        chevron.textContent = '\u203a';
        button.appendChild(chevron);
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            childList.hidden = expanded;
        });
        group.pages.forEach(function (page) {
            var project = projects.filter(function (entry) { return entry[0] === page; })[0];
            var item = document.createElement('li');
            var link = document.createElement('a');
            link.href = project[0];
            var label = document.createElement('span');
            label.textContent = project[1];
            link.appendChild(label);
            if (project[0] === currentPage) {
                item.className = 'active';
                link.setAttribute('aria-current', 'page');
                button.classList.add('has-current-page');
            }
            item.appendChild(link);
            childList.appendChild(item);
        });
        groupItem.appendChild(button);
        groupItem.appendChild(childList);
        list.appendChild(groupItem);
    });
    primaryMenu.insertAdjacentElement('afterend', heading);
    heading.insertAdjacentElement('afterend', list);

    var toggle = document.querySelector('[data-toggle="offcanvas"]');
    var row = document.querySelector('.row-offcanvas');
    var main = document.querySelector('.content-column');
    if (!toggle || !row) return;
    var mobile = window.matchMedia('(max-width: 767px)');
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'sidebar-close';
    close.setAttribute('aria-label', 'Close navigation');
    close.textContent = '\u00d7';
    content.insertBefore(close, content.firstChild);
    var backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'menu-backdrop';
    backdrop.tabIndex = -1;
    backdrop.setAttribute('aria-label', 'Close navigation');
    document.body.appendChild(backdrop);
    toggle.setAttribute('aria-controls', 'sidebar');
    toggle.setAttribute('aria-expanded', 'false');
    function setOpen(open, restoreFocus) {
        row.classList.toggle('active', open);
        document.body.classList.toggle('portfolio-menu-open', open);
        backdrop.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        sidebar.inert = mobile.matches && !open;
        main.inert = mobile.matches && open;
        if (open) close.focus();
        else if (restoreFocus) toggle.focus();
    }
    toggle.addEventListener('click', function () { setOpen(!row.classList.contains('active'), true); });
    close.addEventListener('click', function () { setOpen(false, true); });
    backdrop.addEventListener('click', function () { setOpen(false, true); });
    document.addEventListener('keydown', function (event) {
        if (!mobile.matches || !row.classList.contains('active')) return;
        if (event.key === 'Escape') setOpen(false, true);
        if (event.key !== 'Tab') return;
        var links = Array.prototype.filter.call(sidebar.querySelectorAll('button, a[href]'), function (link) {
            return link.getClientRects().length > 0;
        });
        var first = links[0];
        var last = links[links.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault(); first.focus();
        }
    });
    mobile.addEventListener('change', function () { setOpen(false, false); });
    setOpen(false, false);
}());

(function portfolioMasonry() {
    if (typeof Masonry === 'undefined') return;
    document.querySelectorAll('.grid > .row').forEach(function (row) {
        if (!row.querySelector('.masonry-item')) return;
        row.classList.add('masonry-ready');
        var layout = new Masonry(row, {
            itemSelector: '.masonry-item',
            columnWidth: '.masonry-item',
            gutter: 32,
            percentPosition: true,
            transitionDuration: 0
        });
        if (typeof imagesLoaded !== 'undefined') {
            imagesLoaded(row).on('progress', function () { layout.layout(); });
        }
        if (document.fonts) {
            document.fonts.ready.then(function () { layout.layout(); });
        }
    });
}());

$(function () {

    lightbox();
    carousels();
    utils();
    demo();

});

/* for demo purpose only - can be deleted */

function demo() {

    if ($.cookie("theme_csspath")) {
        $('link#theme-stylesheet').attr("href", $.cookie("theme_csspath"));
    }

    $("#colour").change(function () {

        if ($(this).val() !== '') {

            var theme_csspath = 'css/style.' + $(this).val() + '.css';

            $('link#theme-stylesheet').attr("href", theme_csspath);

            $.cookie("theme_csspath", theme_csspath, {expires: 365, path: '/'});
        }

        return false;
    });

    $("#layout").change(function () {

        if ($(this).val() !== '') {

            var theme_layout = $(this).val();

            $('body').removeClass('wide');
            $('body').removeClass('boxed');

            $('body').addClass(theme_layout);

            $.cookie("theme_layout", theme_layout, {expires: 365, path: '/'});
        }

        return false;
    });
}

/* =========================================
 *  carousels
 *  =======================================*/

function carousels() {

    $('#main-slider').owlCarousel({
	navigation: true, // Show next and prev buttons
	slideSpeed: 300,
	paginationSpeed: 400,
	autoPlay: true,
	stopOnHover: true,
	singleItem: true,
	afterInit: ''
    });
    
    $('#slider').owlCarousel({
	navigation: true, // Show next and prev buttons
	slideSpeed: 300,
	paginationSpeed: 400,
	autoPlay: true,
	stopOnHover: true,
	singleItem: true,
	afterInit: ''
    });
   
}

/* =========================================
 *  masonry
 *  =======================================*/

/* Masonry is initialized independently of jQuery by portfolioMasonry above. */

/* =========================================
 *  Off-canvas menu
 *  =======================================*/

/* Off-canvas behavior is handled by portfolioNavigation above. */


/* =========================================
 *  lightbox
 *  =======================================*/

function lightbox() {

    $(document).delegate('*[data-toggle="lightbox"]', 'click', function (event) {
        event.preventDefault();
        $(this).ekkoLightbox();
    });
}

/* =========================================
 *  utils
 *  =======================================*/

function utils() {

    /* tooltips */

    $('[data-toggle="tooltip"]').tooltip();

    /* click on the box activates the radio */

    $('#checkout').on('click', '.box.shipping-method, .box.payment-method', function (e) {
        var radio = $(this).find(':radio');
        radio.prop('checked', true);
    });
    /* click on the box activates the link in it */

    $('.box.clickable').on('click', function (e) {

        window.location = $(this).find('a').attr('href');
    });
    /* external links in new window*/

    $('.external').on('click', function (e) {

        e.preventDefault();
        window.open($(this).attr("href"));
    });
    /* animated scrolling */

    $('.scroll-to').click(function (event) {
        event.preventDefault();
        var full_url = this.href;
        var parts = full_url.split("#");
        var trgt = parts[1];

        $('body').scrollTo($('#' + trgt), 800, {offset: -80});

    });
}

/* product detail gallery */

function productDetailGallery(confDetailSwitch) {
    $('.thumb:first').addClass('active');
    timer = setInterval(autoSwitch, confDetailSwitch);
    $(".thumb").click(function (e) {

        switchImage($(this));
        clearInterval(timer);
        timer = setInterval(autoSwitch, confDetailSwitch);
        e.preventDefault();
    }
    );
    $('#mainImage').hover(function () {
        clearInterval(timer);
    }, function () {
        timer = setInterval(autoSwitch, confDetailSwitch);
    });
    function autoSwitch() {
        var nextThumb = $('.thumb.active').closest('div').next('div').find('.thumb');
        if (nextThumb.length == 0) {
            nextThumb = $('.thumb:first');
        }
        switchImage(nextThumb);
    }

    function switchImage(thumb) {

        $('.thumb').removeClass('active');
        var bigUrl = thumb.attr('href');
        thumb.addClass('active');
        $('#mainImage img').attr('src', bigUrl);
    }
}

/* product detail sizes */

function productDetailSizes() {
    $('.sizes a').click(function (e) {
        e.preventDefault();
        $('.sizes a').removeClass('active');
        $('.size-input').prop('checked', false);
        $(this).addClass('active');
        $(this).next('input').prop('checked', true);
    });
}


$.fn.alignElementsSameHeight = function () {
    $('.same-height-row').each(function () {

        var maxHeight = 0;
        var children = $(this).find('.same-height');
        children.height('auto');
        if ($(window).width() > 768) {
            children.each(function () {
                if ($(this).innerHeight() > maxHeight) {
                    maxHeight = $(this).innerHeight();
                }
            });
            children.innerHeight(maxHeight);
        }

        maxHeight = 0;
        children = $(this).find('.same-height-always');
        children.height('auto');
        children.each(function () {
            if ($(this).height() > maxHeight) {
                maxHeight = $(this).innerHeight();
            }
        });
        children.innerHeight(maxHeight);

    });
}

$(window).load(function () {

    windowWidth = $(window).width();

    $(this).alignElementsSameHeight();

});
$(window).resize(function () {

    newWindowWidth = $(window).width();

    if (windowWidth !== newWindowWidth) {
        setTimeout(function () {
            $(this).alignElementsSameHeight();
        }, 205);
        windowWidth = newWindowWidth;
    }

});
