var __bind = function (fn, me) {
        return function () {
            return fn.apply(me, arguments);
        };
    },
    __slice = [].slice;


$(document).on('pjax:end', function (event) {
    $(resizeableOptions.container).resizableColumns();
});

function setCookie(name, value, days) {
    var expires = '';
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (JSON.stringify(value) || '') + expires + '; path=/';
}

function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return JSON.parse(c.substring(nameEQ.length, c.length));
        }
    }
}

(function ($, window) {
    var ResizableColumns, parseWidth, pointerX, setWidth;
    parseWidth = function (node) {
        return parseFloat(node.style.width.replace('px', ''));
    };
    setWidth = function (node, width) {
        width = width.toFixed(0);
        width = width > 0 ? width : 0;
        return node.style.width = '' + width + 'px';
    };
    pointerX = function (e) {
        if (e.type.indexOf('touch') === 0) {
            return (e.originalEvent.touches[0] || e.originalEvent.changedTouches[0]).pageX;
        }
        return e.pageX;
    };
    ResizableColumns = (function () {
        ResizableColumns.prototype.defaults = {
            selector: 'tr th:visible',
            syncHandlers: true,
            maxWidth: null,
            minWidth: 20
        };

        function ResizableColumns($table, options) {
            this.pointerdown = __bind(this.pointerdown, this);
            this.constrainWidth = __bind(this.constrainWidth, this);
            this.options = $.extend({}, this.defaults, options);
            this.$table = $table;
            if (resizeableOptions.saveTo == 'cookie') {
                this.restoreColumnWidths();
            }
            this.fixNotSetWidths();
            this.addTableClass();
            this.setHeaders();
            this.syncHandleWidths();
            $(window).on('resize.rc', ((function (_this) {
                return function () {
                    return _this.syncHandleWidths();
                };
            })(this)));
            if (this.options.start) {
                this.$table.bind('column:resize:start.rc', this.options.start);
            }
            if (this.options.resize) {
                this.$table.bind('column:resize.rc', this.options.resize);
            }
            if (this.options.stop) {
                this.$table.bind('column:resize:stop.rc', this.options.stop);
            }
        }

        ResizableColumns.prototype.triggerEvent = function (type, args, original) {
            var event;
            event = $.Event(type);
            event.originalEvent = $.extend({}, original);
            return this.$table.trigger(event, [this].concat(args || []));
        };

        ResizableColumns.prototype.getColumnId = function ($el) {
            return this.$table.data('resizable-columns-id') + '-' + $el.data('resizable-column-id');
        };

        ResizableColumns.prototype.setHeaders = function () {
            this.$tableHeaders = this.$table.find(this.options.selector);
            this.assignPercentageWidths();
            return this.createHandles();
        };

        ResizableColumns.prototype.destroy = function () {
            this.$handleContainer.remove();
            this.$table.removeData('resizableColumns');
            return this.$table.add(window).off('.rc');
        };

        ResizableColumns.prototype.assignPercentageWidths = function () {
            return this.$tableHeaders.each((function (_this) {
                return function (_, el) {
                    var $el;
                    $el = $(el);
                    return setWidth($el[0], $el.outerWidth());
                };
            })(this));
        };

        ResizableColumns.prototype.createHandles = function () {
            var _ref;
            if ((_ref = this.$handleContainer) != null) {
                _ref.remove();
            }
            this.$table.prepend((this.$handleContainer = $('<div class=\'rc-handle-container\' />')));
            this.$tableHeaders.each((function (_this) {
                return function (i, el) {
                    var $handle;
                    if (_this.$tableHeaders.eq(i).length === 0 || (_this.$tableHeaders.eq(i).attr('data-noresize') != null)) {
                        return;
                    }
                    $handle = $("<div class='rc-handle' />");
                    $handle.data('th', $(el));
                    return $handle.appendTo(_this.$handleContainer);
                };
            })(this));
            return this.$handleContainer.on('mousedown touchstart', '.rc-handle', this.pointerdown);
        };

        ResizableColumns.prototype.syncHandleWidths = function () {
            return this.$handleContainer.width('auto !important; ').find('.rc-handle').each((function (_this) {
                return function (_, el) {
                    var $el;
                    $el = $(el);
                    return $el.css({
                        left: $el.data('th').outerWidth() + ($el.data('th').offset().left - _this.$handleContainer.offset().left),
                        height: _this.$table.find('thead').height()
                    });
                };
            })(this));
        };

        ResizableColumns.prototype.saveColumnWidths = function () {
            var columnsWidth = {};
            $('th').each(function () {
                columnsWidth[$(this).attr('data-col-seq')] = {'width': this.style.width};
            });
            if (resizeableOptions.saveTo == 'path') {
                $.post(resizeableOptions.url,
                    $.extend({options: columnsWidth}, resizeableOptions.urlOptions),
                    function (res) {
                    }
                );
            }
            if (resizeableOptions.saveTo == 'cookie') {
                setCookie('resizeableOptions', columnsWidth);
            }
        };

        ResizableColumns.prototype.restoreColumnWidths = function () {
            if (resizeableOptions.saveTo == 'cookie') {
                let columnsWidth = getCookie('resizeableOptions');
                $('th').each(function () {
                    if (columnsWidth.hasOwnProperty($(this).attr('data-col-seq'))) {
                        let columnProperty = columnsWidth[$(this).attr('data-col-seq')];
                        if (columnProperty.hasOwnProperty('width')) {
                            this.style.width = '' + columnsWidth[$(this).attr('data-col-seq')].width + 'px';
                        }
                    }
                });
            }
        };

        ResizableColumns.prototype.fixNotSetWidths = function () {
            $('th').each(function () {
                if (!this.style.width.includes('px')) {
                    this.style.width = '' + $(this).width() + 'px';
                }
            });
        };

        ResizableColumns.prototype.addTableClass = function () {
            $('.table').addClass('resizable-table');
        };

        ResizableColumns.prototype.totalColumnWidths = function () {
            var total;
            total = 0;
            this.$tableHeaders.each((function (_this) {
                return function (_, el) {
                    return total += parseFloat($(el)[0].style.width.replace('px', ''));
                };
            })(this));
            return total;
        };

        ResizableColumns.prototype.constrainWidth = function (width) {
            if (this.options.minWidth != null) {
                width = Math.max(this.options.minWidth, width);
            }
            if (this.options.maxWidth != null) {
                width = Math.min(this.options.maxWidth, width);
            }
            return width;
        };

        ResizableColumns.prototype.pointerdown = function (e) {
            var $currentGrip, $leftColumn, $ownerDocument, newWidths, startPosition, widths;
            e.preventDefault();
            $ownerDocument = $(e.currentTarget.ownerDocument);
            startPosition = pointerX(e);
            $currentGrip = $(e.currentTarget);
            $leftColumn = $currentGrip.data('th');
            widths = {
                left: parseWidth($leftColumn[0])
            };
            newWidths = {
                left: widths.left
            };
            this.$handleContainer.add(this.$table).addClass('rc-table-resizing');
            $leftColumn.add($currentGrip).addClass('rc-column-resizing');
            this.triggerEvent('column:resize:start', [$leftColumn, newWidths.left], e);
            $ownerDocument.on('mousemove.rc touchmove.rc', (function (_this) {
                return function (e) {
                    var difference;
                    difference = (pointerX(e) - startPosition);
                    setWidth($leftColumn[0], newWidths.left = _this.constrainWidth(widths.left + difference));
                    _this.syncHandleWidths();
                    return _this.triggerEvent('column:resize', [$leftColumn, newWidths.left], e);
                };
            })(this));
            return $ownerDocument.one('mouseup touchend', (function (_this) {
                return function () {
                    $ownerDocument.off('mousemove.rc touchmove.rc');
                    _this.$handleContainer.add(_this.$table).removeClass('rc-table-resizing');
                    $leftColumn.add($currentGrip).removeClass('rc-column-resizing');
                    _this.syncHandleWidths();
                    _this.saveColumnWidths();
                    return _this.triggerEvent('column:resize:stop', [$leftColumn, newWidths.left], e);
                };
            })(this));
        };

        return ResizableColumns;

    })();
    return $.fn.extend({
        resizableColumns: function () {
            var args, option;
            option = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            return this.each(function () {
                var $table, data;
                $table = $(this);
                data = $table.data('resizableColumns');
                if (!data) {
                    $table.data('resizableColumns', (data = new ResizableColumns($table, option)));
                }
                if (typeof option === 'string') {
                    return data[option].apply(data, args);
                }
            });
        }
    });
})(window.jQuery, window);
