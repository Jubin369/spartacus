import { Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  QuickOrderAddEntryEvent,
  QuickOrderFacade,
} from '@spartacus/cart/quick-order/root';
import {
  ActiveCartService,
  GlobalMessageService,
  GlobalMessageType,
  I18nTestingModule,
  OrderEntry,
  Product,
  Translatable,
} from '@spartacus/core';
import { CmsComponentData } from '@spartacus/storefront';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CmsQuickOrderComponent } from '../../core/models/cms.model';
import { QuickOrderStatePersistenceService } from '../../core/services/quick-order-state-persistance.service';
import { QuickOrderComponent } from './quick-order.component';

const mockProduct: Product = {
  code: '123456789',
};
const mockProduct2: Product = {
  code: '987654321',
};
const mockEntry: OrderEntry = {
  product: mockProduct,
};
const mockEntry2: OrderEntry = {
  product: mockProduct2,
};

const mockQuickOrderAddEntryEvent: QuickOrderAddEntryEvent = {
  entry: {
    product: {
      name: 'TestName',
      code: '987654321',
    },
  },
  productCode: '987654321',
  quantity: 2,
  quantityAdded: 1,
};

const mockEntries$ = new BehaviorSubject<OrderEntry[]>([mockEntry]);

class MockQuickOrderFacade implements Partial<QuickOrderFacade> {
  getEntries(): BehaviorSubject<OrderEntry[]> {
    return mockEntries$;
  }
  clearList(): void {}
  addToCart(): Observable<[OrderEntry[], QuickOrderAddEntryEvent[]]> {
    return combineLatest([mockEntries$.asObservable()]).pipe(
      map(([entries]) => [entries, []])
    );
  }
}

class MockQuickOrderStatePersistenceService
  implements Partial<QuickOrderStatePersistenceService> {
  initSync(): void {}
}

const mockIsStable$ = new BehaviorSubject<boolean>(true);
const mockCartId$ = new BehaviorSubject<string>('123456789');

class MockActiveCartService implements Partial<ActiveCartService> {
  getActiveCartId(): Observable<string> {
    return mockCartId$.asObservable();
  }
  addEntries(_cartEntries: OrderEntry[]): void {}
  isStable(): Observable<boolean> {
    return mockIsStable$.asObservable();
  }
}

class MockGlobalMessageService implements Partial<GlobalMessageService> {
  add(
    _text: string | Translatable,
    _type: GlobalMessageType,
    _timeout?: number
  ): void {}
}

const mockData: CmsQuickOrderComponent = {
  quickOrderListLimit: 10,
};

const MockCmsComponentData = <CmsComponentData<any>>{
  data$: of(mockData),
};

@Component({
  template: '',
  selector: 'cx-quick-order-form',
})
class MockQuickOrderFormComponent {
  @Input() isDisabled: boolean;
  @Input() isLoading: boolean;
}

@Component({
  template: '',
  selector: 'cx-quick-order-table',
})
class MockQuickOrderTableComponent {
  @Input() entries: OrderEntry[];
  @Input() loading: boolean;
}

@Component({
  template: '',
  selector: 'cx-progress-button',
})
class MockProgressButtonComponent {
  @Input() loading: boolean;
  @Input() disabled: boolean;
}

describe('QuickOrderComponent', () => {
  let component: QuickOrderComponent;
  let fixture: ComponentFixture<QuickOrderComponent>;
  let quickOrderService: QuickOrderFacade;
  let globalMessageService: GlobalMessageService;
  let el: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [
        QuickOrderComponent,
        MockQuickOrderFormComponent,
        MockQuickOrderTableComponent,
        MockProgressButtonComponent,
      ],
      providers: [
        { provide: ActiveCartService, useClass: MockActiveCartService },
        { provide: GlobalMessageService, useClass: MockGlobalMessageService },
        { provide: QuickOrderFacade, useClass: MockQuickOrderFacade },
        {
          provide: QuickOrderStatePersistenceService,
          useClass: MockQuickOrderStatePersistenceService,
        },
        {
          provide: CmsComponentData,
          useValue: MockCmsComponentData,
        },
      ],
    }).compileComponents();

    quickOrderService = TestBed.inject(QuickOrderFacade);
    globalMessageService = TestBed.inject(GlobalMessageService);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickOrderComponent);
    component = fixture.componentInstance;
    el = fixture.debugElement;
    component.ngOnInit();

    mockEntries$.next([mockEntry]);
    mockIsStable$.next(true);
    mockCartId$.next('123456789');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger clear the list method from the service', () => {
    spyOn(quickOrderService, 'clearList').and.callThrough();
    spyOn(globalMessageService, 'add').and.stub();

    component.clear();
    expect(quickOrderService.clearList).toHaveBeenCalled();
    expect(globalMessageService.add).toHaveBeenCalledWith(
      {
        key: 'quickOrderTable.listCleared',
      },
      GlobalMessageType.MSG_TYPE_INFO
    );
  });

  describe('should trigger add to cart', () => {
    it('in standard way', () => {
      spyOn(quickOrderService, 'addToCart').and.returnValue(
        of([[mockEntry], []])
      );
      spyOn(globalMessageService, 'add').and.stub();

      component.addToCart([]);

      expect(quickOrderService.addToCart).toHaveBeenCalled();
      expect(globalMessageService.add).toHaveBeenCalledWith(
        {
          key: 'quickOrderTable.addedtoCart',
        },
        GlobalMessageType.MSG_TYPE_CONFIRMATION
      );
    });

    it('with warning and success messages', () => {
      spyOn(quickOrderService, 'addToCart').and.returnValue(
        of([[mockEntry, mockEntry2], [mockQuickOrderAddEntryEvent]])
      );

      component.addToCart([]);
      fixture.detectChanges();

      expect(quickOrderService.addToCart).toHaveBeenCalled();
      expect(el.query(By.css('cx-message .quick-order-warnings'))).toBeTruthy();
    });
  });

  it('should hide "empty list" button if there are no entries', () => {
    mockEntries$.next([]);
    fixture.detectChanges();

    expect(el.query(By.css('.clear-button'))).toBeNull();
  });

  it('should disable clear list action when cart is not stable', () => {
    mockIsStable$.next(false);
    fixture.detectChanges();

    expect(
      el.query(By.css('.clear-button')).nativeElement.disabled
    ).toBeTruthy();
  });
});