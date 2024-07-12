import { rndNumber } from '@utils/index';
import { anyString, spy, when } from 'ts-mockito';
import { container, inject, injectable, singleton } from 'tsyringe';
import { expect, test } from 'vitest';

test('demo', async () => {
  expect(true).toBe(true);
});

test('service', async () => {
  const service = container.resolve(MainService);
  const data = await service.getValue1();
  expect(data).toBe('Original Value');

  const mockTestService = () => {
    const instance = new TestService();
    const mock: TestService = spy(instance);
    when(mock.getValue2(anyString(), anyString())).thenCall((id, param) => `[${id}/${instance.id}] Mock Value 2 / ${param}`);
    return instance;
  };
  container.registerInstance(TestService, mockTestService()); // Singleton
  // container.register(TestService, { useFactory: () => mockTestService() }); // Transient

  const testServiceMock = container.resolve(TestService);
  const serviceMock = container.resolve(MainService);

  const dataMock1 = await serviceMock.getValue1();
  expect(dataMock1).toBe('Original Value');

  const dataMock2 = await serviceMock.getValue2('123');
  expect(dataMock2).toBe(`[${serviceMock.id}/${testServiceMock.id}] Mock Value 2 / ${'123'}`);
});

@singleton()
export class TestService {
  public id = rndNumber().toString();

  getValue1() {
    return 'Original Value';
  }

  getValue2(id: string, param: string) {
    return `[${id}/${this.id}] Original Value / ${param}`;
  }
}

@injectable()
export class MainService {
  public id = rndNumber().toString();

  constructor(@inject(TestService) private testService: TestService) {}

  getValue1() {
    return this.testService.getValue1();
  }

  getValue2(param: string) {
    return this.testService.getValue2(this.id, param);
  }
}
