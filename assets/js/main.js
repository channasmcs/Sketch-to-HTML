var MyApp = MyApp || {};
MyApp.Function = MyApp.Function || {};

MyApp.Function.PlaneSpotting = (function () {
  const self = this,
    date_format = 'YYYY-MM-DD',
    class_open  = 'open',
    class_hide  = 'd-none',
    $el_loader  = $('#data-loader'),
    $el_sideNav = $('.side-nav'),
    $el_body    = $('body'),
    id_filter_form    = 'filter-form',
    id_filters_spott  = 'filters-spott',
    id_render_spotting_data = 'render-spotting-data';
    ($el_list_render      = $('#render-spotting-data')),
    ($el_spotting_model   = $('.spotting-model')),
    ($el_spotting_button  = $('.submit-spotting')),
    ($el_spotting_close   = $('.close')),
    (class_delete_item    = '.delete-list-item'),
    ($el_filter = {
      make: '#filter-make',
      model: '#filter-model',
      registation: '#filter-registation',
    }),
    (ToDate = new Date());

  let PlaneSpotListData = {},
    filterProps = {
      make: null,
      model: null,
      registation: null,
    };
    
  self.PlaneSpotList = ko.observableArray([]);

  const Init = {
    GetPlaneSpotList: () => {
      ko.applyBindings(
        new Init.ListSpot.RenderHTTPList(
          './assets/mock-data/plane_spotters.json'
        ),
        document.getElementById(id_render_spotting_data)
      );
    },
    ListSpot: {
      RenderHTTPList: function (url) {
        $el_loader.removeClass(class_hide);
        try {
          axios
            .get(url, {
              headers: {
                'Access-Control-Allow-Origin': '*',
                responseType: 'json',
              },
            })
            .then(function (response) {
              const getData = response.data;
              if (getData.length > 0) {
                $el_loader.addClass(class_hide);
                $el_list_render.removeClass(class_hide);
                PlaneSpotListData = getData;
                Init.ListSpot.ApplyPlaneSpotList(getData);
                Init.Filters.FilterSpott(getData);
                Init.ListSpot.DeleteSpott();
                Init.ListSpot.EditSpott();
              } else {
                alert(message.list.not_found);
              }
            })
            .catch(function (error) {
              if (error.response) {
                alert(error.response);
              }
            });
        } catch (err) {
          alert(err);
        }
      },
      ApplyPlaneSpotList: function (response) {
        self.PlaneSpotList(
          $.map(
            response,
            (item) => new Init.ListSpot.PlaneSpotListViewModel(item)
          )
        );
      },
      PlaneSpotListViewModel: function (data) {
        const self = this;
        const { id, registation, make, model, date, time, location, image } =
          data;

        self._Id = ko.observable(id);
        self._Registation = ko.observable(registation);
        self._Make  = ko.observable(make);
        self._Model = ko.observable(model);
        self._Date  = ko.observable(moment(date).format('MMM D, YYYY'));
        self._Time  = ko.observable(time);
        self._Location  = ko.observable(location);
        self._ImageUrl  = ko.observable(image);
        self._ModelIcon = ko.observable(
          './assets/imgs/model/' +
            (make === 'Airbus' || make === 'airbus'
              ? 'model_airbus.svg.png'
              : 'model_boeing.svg.png')
        );
      },
      DeleteSpott: () => {
        $('.delete-list-item').on('click', function (e) {
          e.preventDefault();
          let getNewList = PlaneSpotListData.filter(
            (item) => item.id !== Number($(this).attr('item'))
          );
          PlaneSpotListData = getNewList;
          Init.ListSpot.ApplyPlaneSpotList(getNewList);
          Init.Filters.FilterSpott(getNewList);
          Init.ListSpot.DeleteSpott();
          Init.ListSpot.EditSpott();
        });
      },
      EditSpott: () => {
        $('.edit-list-item').on('click', function (e) {
          e.preventDefault();
          $ko_element = document.getElementById(id_filter_form);
          ko.cleanNode($ko_element);
          Init.SideNav.FormSubmit(Number($(this).attr('item')));
          $el_spotting_button.trigger('click');
        });
      },
    },
    SideNav: {
      EventListners: function () {
        $el_spotting_button.on('click', function (e) {
          e.preventDefault();
          openSpotModel(
            $el_spotting_model,
            $el_sideNav,
            $el_body,
            class_hide,
            class_open,
          );
        });
        $el_spotting_close.on('click', function (e) {
          e.preventDefault();
          openSpotModel(
            $el_spotting_model,
            $el_sideNav,
            $el_body,
            class_hide,
            class_open,
          );
          $ko_element = document.getElementById(id_filter_form);
          ko.cleanNode($ko_element);
          Init.SideNav.FormSubmit();
        });
      },
      FormSubmit: function (Id = null) {
        let editData = {},  viewModel = null;
        if (Id) {
          editData = PlaneSpotListData.filter((item) => item.id === Id)[0];
        }
        ko.validation.init(
          {
            registerExtenders: true,
            messagesOnModified: true,
            insertMessages: true,
            parseInputAttributes: true,
            messageTemplate: null,
          },
          true
        );

        const validateRegister = (val) => {
          const isExit = /[-]/;
          let status = false;

          if (isExit.test(val) && val.length === 6) {
            if (val.indexOf('-') === 1 || val.indexOf('-') === 2) {
              status = true;
            }
          }
          return status;
        };

        const validDate = (val) => {
          let status = false;
          if (new Date(val).getTime() <= ToDate.getTime()) {
            status = true;
          }
          return status;
        };

        const validTime = (val) => {
          let status = false;
          let isValidDate = viewModel
            ? viewModel.date() &&
              moment(ToDate).format(date_format) >=
                moment(viewModel.date()).format(date_format)
            : false;
          let isToday = viewModel
            ? moment(ToDate).format(date_format) ===
              moment(viewModel.date()).format(date_format)
            : false;

          if ((editData.date && !isValidDate) || isValidDate) {
            status = true;
            if (
              isToday &&
              new Date(ToDate).getHours() +
                ':' +
                ('0' + new Date(ToDate).getMinutes()).slice(-2) <
                val
            ) {
              status = false;
            }
          }
          return status;
        };

        viewModel = {
          registation: ko.observable(Id ? editData.registation : null).extend({
            required: true,
            validation: {
              validator: validateRegister,
              message: message.validation.valid_suffix,
            },
          }),
          make: ko.observable(Id ? editData.make : null).extend({
            required: true,
            maxLength: 128,
            message: message.validation.char_128,
          }),
          model: ko.observable(Id ? editData.model : null).extend({
            required: true,
            maxLength: 128,
            message: message.validation.char_128,
          }),
          date: ko.observable(Id ? editData.date : null).extend({
            required: true,
            validation: {
              validator: validDate,
              message: message.validation.date,
            },
          }),
          time: ko.observable(Id ? editData.time : null).extend({
            required: true,
            validation: {
              validator: validTime,
              message: message.validation.time,
            },
          }),
          location: ko.observable(Id ? editData.location : null).extend({
            required: true,
            maxLength: 255,
            message: message.validation.char_255,
          }),
          image: ko.observable(Id ? editData.image : null).extend({
            required: true,
          }),
          fileUpload: function (data, e) {
            if (e) {
              const file = e.target.files[0],
              reader = new FileReader();

              reader.onloadend = function () {
                const result = reader.result;
                viewModel.image(result);
                return result;
              };

              if (file) {
                reader.readAsDataURL(file);
              }
            }
          },

          submit: function () {
            if (viewModel.errors().length === 0) {
              const setNewSpot = {
                id: !Id ? PlaneSpotListData.length + 1 : Id,
                registation: viewModel.registation(),
                make: viewModel.make(),
                model: viewModel.model(),
                date: viewModel.date(),
                time: viewModel.time(),
                location: viewModel.location(),
                image: viewModel.image(),
              };

              if (Id) {
                PlaneSpotListData = PlaneSpotListData.filter(
                  (item) => item.id !== Id
                );
              }
              const setNewModel = [...PlaneSpotListData, setNewSpot].sort(
                (X, Y) => X.id - Y.id
              );
              setTimeout(() => {
                Init.ListSpot.ApplyPlaneSpotList(setNewModel);
                Init.Filters.FilterSpott(setNewModel);
                Init.ListSpot.DeleteSpott();
                Init.ListSpot.EditSpott();
              }, 100);

              PlaneSpotListData = setNewModel;
              viewModel.reset();
              $el_spotting_close.trigger('click');
            } else {
              viewModel.errors.showAllMessages();
            }
          },
          reset: function () {
            Object.keys(viewModel).forEach((name) => {
              if (ko.isWritableObservable(viewModel[name])) {
                viewModel[name](undefined);
              }
            });
            if (ko.validation.utils.isValidatable(viewModel.location)) {
              viewModel.location.rules.removeAll();
            }
            viewModel.errors.showAllMessages(false);
          },
        };
        viewModel.errors = ko.validation.group(viewModel);
        viewModel.requireLocation = function () {
          viewModel.location.extend({ required: true });
        };

        ko.applyBindings(viewModel, document.getElementById(id_filter_form));
      },
    },
    Filters: {
      FilterSpott: (getList) => {
        $ko_element = document.getElementById(id_filters_spott);
        ko.cleanNode($ko_element);
        let listMake = [],
          listModel = [];
        getList.forEach(function (item) {
          if ($.inArray(item.make, listMake) === -1) {
            listMake.push(item.make);
          }
          if ($.inArray(item.model, listModel) === -1) {
            listModel.push(item.model);
          }
        });

        let viewModel = {
          makeList: ko.observableArray(listMake),
          modelList: ko.observableArray(listModel),
        };

        ko.applyBindings(viewModel, $ko_element);
        Init.Filters.SelectFilters();
      },
      SelectFilters: () => {
        $($el_filter.make).on('change', function () {
          filterProps = { ...filterProps, make: this.value };
          Init.Filters.SetFilterResult(filterProps);
        });
        $($el_filter.model).on('change', function () {
          filterProps = { ...filterProps, model: this.value };
          Init.Filters.SetFilterResult(filterProps);
        });
        $($el_filter.registation).on('input', function () {
          filterProps = { ...filterProps, registation: this.value };
          Init.Filters.SetFilterResult(filterProps);
        });
      },
      SetFilterResult: (filterData) => {
        let filteredResult = PlaneSpotListData;

        if (filterData.make) {
          filteredResult = filteredResult.filter(
            (item) => item.make === filterData.make
          );
        }

        if (filterData.model) {
          filteredResult = filteredResult.filter(
            (item) => item.model === filterData.model
          );
        }

        if (filterData.registation && filterData.registation.length > 5) {
          filteredResult = filteredResult.filter(
            (item) => item.registation === filterData.registation
          );
        }

        Init.ListSpot.ApplyPlaneSpotList(filteredResult);
        Init.Filters.FilterSpott(filteredResult);
        Init.ListSpot.DeleteSpott();
        Init.ListSpot.EditSpott();
        applyErrorMsg(
          filteredResult,
          $el_list_render,
          'not-found-result',
          message.list.not_found
        );
      },
    },
  };
  return Init;
})();

$(function () {
  'use strict';
  MyApp.Function.PlaneSpotting.GetPlaneSpotList();
  MyApp.Function.PlaneSpotting.SideNav.EventListners();
  MyApp.Function.PlaneSpotting.SideNav.FormSubmit();
  
});
